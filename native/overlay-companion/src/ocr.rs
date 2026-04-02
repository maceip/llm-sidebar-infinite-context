/// PP-OCRv5 mobile ONNX pipeline — cross-platform text recognition.
///
/// Pipeline: detect text regions → recognize characters (CTC decode).
/// Models: ~12.6 MB total, ~25–80 ms per frame on CPU.
use anyhow::{anyhow, Context, Result};
use std::path::{Path, PathBuf};

#[derive(Debug, Clone)]
pub struct TextRegion {
    pub text: String,
    pub confidence: f32,
    pub bbox: [f32; 8],
}

#[derive(Debug, Clone)]
pub struct OcrResult {
    pub regions: Vec<TextRegion>,
    pub full_text: String,
    pub elapsed_ms: u64,
}

pub struct OcrEngine {
    det_session: ort::session::Session,
    rec_session: ort::session::Session,
    dictionary: Vec<String>,
}

fn ort_err(e: impl std::fmt::Display) -> anyhow::Error {
    anyhow!("ort: {e}")
}

impl OcrEngine {
    pub fn load(model_dir: &Path) -> Result<Self> {
        let det_path = model_dir.join("det.onnx");
        let rec_path = model_dir.join("rec.onnx");
        let dict_path = model_dir.join("dict.txt");

        let det_session = ort::session::Session::builder()
            .map_err(ort_err)?
            .with_intra_threads(2)
            .map_err(ort_err)?
            .commit_from_file(&det_path)
            .map_err(|e| anyhow!("loading det model {}: {e}", det_path.display()))?;

        let rec_session = ort::session::Session::builder()
            .map_err(ort_err)?
            .with_intra_threads(2)
            .map_err(ort_err)?
            .commit_from_file(&rec_path)
            .map_err(|e| anyhow!("loading rec model {}: {e}", rec_path.display()))?;

        let dict_text = std::fs::read_to_string(&dict_path)
            .with_context(|| format!("reading dict: {}", dict_path.display()))?;
        let mut dictionary: Vec<String> = dict_text.lines().map(|l| l.to_string()).collect();
        dictionary.insert(0, String::new());
        dictionary.push(" ".to_string());

        eprintln!("ocr: loaded models from {}", model_dir.display());
        Ok(Self { det_session, rec_session, dictionary })
    }

    pub fn find_models_dir() -> Option<PathBuf> {
        if let Ok(exe) = std::env::current_exe() {
            if let Some(dir) = exe.parent() {
                let m = dir.join("models");
                if m.join("det.onnx").exists() { return Some(m); }
                if dir.join("det.onnx").exists() { return Some(dir.to_path_buf()); }
            }
        }
        if let Some(cfg) = dirs::config_dir() {
            let m = cfg.join("overlay-companion").join("models");
            if m.join("det.onnx").exists() { return Some(m); }
        }
        None
    }

    pub fn recognize(&mut self, img_data: &[u8], width: u32, height: u32) -> Result<OcrResult> {
        let start = std::time::Instant::now();
        let boxes = self.detect(img_data, width, height)?;

        if boxes.is_empty() {
            return Ok(OcrResult {
                regions: vec![], full_text: String::new(),
                elapsed_ms: start.elapsed().as_millis() as u64,
            });
        }

        let mut regions = Vec::with_capacity(boxes.len());
        for bbox in &boxes {
            let cw = crop_width(bbox);
            let ch = crop_height(bbox);
            if cw < 4 || ch < 4 { continue; }
            let cropped = crop_region(img_data, width, height, bbox);
            if cropped.is_empty() { continue; }

            let (text, conf) = self.recognize_text(&cropped, cw, ch)?;
            eprintln!("  rec[{}x{}]: conf={:.2} text=\"{}\"", cw, ch, conf, &text[..text.len().min(60)]);
            if !text.is_empty() && conf > 0.1 {
                regions.push(TextRegion { text, confidence: conf, bbox: *bbox });
            }
        }

        regions.sort_by(|a, b| {
            if (a.bbox[1] - b.bbox[1]).abs() < 15.0 {
                a.bbox[0].partial_cmp(&b.bbox[0]).unwrap()
            } else {
                a.bbox[1].partial_cmp(&b.bbox[1]).unwrap()
            }
        });

        let full_text = regions.iter().map(|r| r.text.as_str()).collect::<Vec<_>>().join("\n");
        Ok(OcrResult { regions, full_text, elapsed_ms: start.elapsed().as_millis() as u64 })
    }

    fn detect(&mut self, img_data: &[u8], width: u32, height: u32) -> Result<Vec<[f32; 8]>> {
        let (dw, dh) = det_resize(width, height);
        let input = preprocess(img_data, width, height, dw, dh, &[0.485, 0.456, 0.406], &[0.229, 0.224, 0.225]);
        let shape = vec![1, 3, dh as i64, dw as i64];
        let input_val = ort::value::Tensor::from_array((shape, input)).map_err(ort_err)?;
        let outputs = self.det_session.run(ort::inputs!["x" => input_val]).map_err(ort_err)?;
        let (_det_shape, data) = outputs[0].try_extract_tensor::<f32>().map_err(ort_err)?;

        let h = dh as usize;
        let w = dw as usize;
        let sx = width as f32 / dw as f32;
        let sy = height as f32 / dh as f32;

        // Binarize
        let mut mask = vec![false; h * w];
        for i in 0..data.len().min(h * w) {
            if data[i] > 0.3 { mask[i] = true; }
        }

        // Dilate mask to merge nearby characters into text lines
        // Horizontal dilation is larger (chars are closer horizontally)
        let dilate_x = 8usize;
        let dilate_y = 3usize;
        let mut dilated = vec![false; h * w];
        for y in 0..h {
            for x in 0..w {
                if !mask[y * w + x] { continue; }
                let y_lo = y.saturating_sub(dilate_y);
                let y_hi = (y + dilate_y + 1).min(h);
                let x_lo = x.saturating_sub(dilate_x);
                let x_hi = (x + dilate_x + 1).min(w);
                for dy in y_lo..y_hi {
                    for dx in x_lo..x_hi {
                        dilated[dy * w + dx] = true;
                    }
                }
            }
        }

        // Flood fill on dilated mask → text line bounding boxes
        let mut visited = vec![false; h * w];
        let mut boxes = Vec::new();
        for y in 0..h {
            for x in 0..w {
                let i = y * w + x;
                if dilated[i] && !visited[i] {
                    let (bx0, by0, bx1, by1) = flood_fill(&dilated, &mut visited, w, h, x, y);
                    let bw = bx1 - bx0;
                    let bh = by1 - by0;
                    // Filter: text lines should be wider than tall, and at least ~20px wide
                    if bw > 15 && bh > 3 {
                        // Add some padding
                        let pad = 2;
                        let x0 = bx0.saturating_sub(pad);
                        let y0 = by0.saturating_sub(pad);
                        let x1 = (bx1 + pad + 1).min(w);
                        let y1 = (by1 + pad + 1).min(h);
                        let fx0 = x0 as f32 * sx;
                        let fy0 = y0 as f32 * sy;
                        let fx1 = x1 as f32 * sx;
                        let fy1 = y1 as f32 * sy;
                        boxes.push([fx0, fy0, fx1, fy0, fx1, fy1, fx0, fy1]);
                    }
                }
            }
        }
        eprintln!("det: {} text line boxes found", boxes.len());
        Ok(boxes)
    }

    fn recognize_text(&mut self, img_data: &[u8], width: u32, height: u32) -> Result<(String, f32)> {
        let rh = 48u32;
        let rw = (((rh as f32 * width as f32 / height as f32).ceil() as u32).max(48) + 31) / 32 * 32;
        let input = preprocess(img_data, width, height, rw, rh, &[0.5, 0.5, 0.5], &[0.5, 0.5, 0.5]);
        let shape = vec![1, 3, rh as i64, rw as i64];
        let input_val = ort::value::Tensor::from_array((shape, input)).map_err(ort_err)?;
        let outputs = self.rec_session.run(ort::inputs!["x" => input_val]).map_err(ort_err)?;
        let (shape_ref, data) = outputs[0].try_extract_tensor::<f32>().map_err(ort_err)?;
        let shape: Vec<usize> = shape_ref.iter().map(|&d| d as usize).collect();

        // CTC decode: shape [1, seq_len, num_classes]
        let seq_len = shape[1] as usize;
        let num_cls = shape[2] as usize;

        let mut text = String::new();
        let mut total_conf = 0.0f32;
        let mut n = 0u32;
        let mut last = 0usize;

        for t in 0..seq_len {
            let offset = t * num_cls;
            let (mut bi, mut bv) = (0, f32::NEG_INFINITY);
            for c in 0..num_cls {
                let v = data[offset + c];
                if v > bv { bv = v; bi = c; }
            }
            if bi != 0 && bi != last {
                if let Some(ch) = self.dictionary.get(bi) {
                    text.push_str(ch);
                    // Use sigmoid of max logit as confidence proxy
                    let conf = 1.0 / (1.0 + (-bv).exp());
                    total_conf += conf;
                    n += 1;
                }
            }
            last = bi;
        }

        Ok((text.trim().to_string(), if n > 0 { total_conf / n as f32 } else { 0.0 }))
    }
}

fn flood_fill(mask: &[bool], vis: &mut [bool], w: usize, h: usize, sx: usize, sy: usize) -> (usize, usize, usize, usize) {
    let (mut mnx, mut mny, mut mxx, mut mxy) = (sx, sy, sx, sy);
    let mut stack = vec![(sx, sy)];
    vis[sy * w + sx] = true;
    while let Some((cx, cy)) = stack.pop() {
        mnx = mnx.min(cx); mxx = mxx.max(cx);
        mny = mny.min(cy); mxy = mxy.max(cy);
        for (dx, dy) in [(1i32,0),(-1,0),(0,1),(0,-1)] {
            let (nx, ny) = (cx as i32 + dx, cy as i32 + dy);
            if nx >= 0 && nx < w as i32 && ny >= 0 && ny < h as i32 {
                let ni = ny as usize * w + nx as usize;
                if mask[ni] && !vis[ni] { vis[ni] = true; stack.push((nx as usize, ny as usize)); }
            }
        }
    }
    (mnx, mny, mxx, mxy)
}

fn det_resize(w: u32, h: u32) -> (u32, u32) {
    let r = if w.max(h) > 960 { 960.0 / w.max(h) as f32 } else { 1.0 };
    let nw = ((w as f32 * r).round() as u32).max(32);
    let nh = ((h as f32 * r).round() as u32).max(32);
    (((nw + 31) / 32) * 32, ((nh + 31) / 32) * 32)
}

fn preprocess(rgba: &[u8], sw: u32, sh: u32, dw: u32, dh: u32, mean: &[f32; 3], std: &[f32; 3]) -> Vec<f32> {
    let ds = (dw * dh) as usize;
    let mut out = vec![0.0f32; 3 * ds];
    let stride = sw as usize * 4;
    for y in 0..dh {
        for x in 0..dw {
            let sx = x as f32 * (sw as f32 / dw as f32);
            let sy = y as f32 * (sh as f32 / dh as f32);
            let x0 = (sx.floor() as u32).min(sw - 1);
            let y0 = (sy.floor() as u32).min(sh - 1);
            let x1 = (x0 + 1).min(sw - 1);
            let y1 = (y0 + 1).min(sh - 1);
            let fx = sx - x0 as f32;
            let fy = sy - y0 as f32;
            for c in 0..3usize {
                let p00 = rgba[y0 as usize * stride + x0 as usize * 4 + c] as f32;
                let p10 = rgba[y0 as usize * stride + x1 as usize * 4 + c] as f32;
                let p01 = rgba[y1 as usize * stride + x0 as usize * 4 + c] as f32;
                let p11 = rgba[y1 as usize * stride + x1 as usize * 4 + c] as f32;
                let v = p00*(1.0-fx)*(1.0-fy) + p10*fx*(1.0-fy) + p01*(1.0-fx)*fy + p11*fx*fy;
                out[c * ds + y as usize * dw as usize + x as usize] = (v / 255.0 - mean[c]) / std[c];
            }
        }
    }
    out
}

fn crop_region(rgba: &[u8], w: u32, h: u32, bbox: &[f32; 8]) -> Vec<u8> {
    let x0 = bbox[0].min(bbox[6]).max(0.0) as u32;
    let x1 = (bbox[2].max(bbox[4]).ceil() as u32).min(w);
    let y0 = bbox[1].min(bbox[3]).max(0.0) as u32;
    let y1 = (bbox[5].max(bbox[7]).ceil() as u32).min(h);
    let cw = x1.saturating_sub(x0);
    let ch = y1.saturating_sub(y0);
    if cw == 0 || ch == 0 { return vec![]; }
    let stride = w as usize * 4;
    let mut out = Vec::with_capacity((cw * ch * 4) as usize);
    for row in y0..y1 {
        let s = row as usize * stride + x0 as usize * 4;
        out.extend_from_slice(&rgba[s..s + cw as usize * 4]);
    }
    out
}

fn crop_width(b: &[f32; 8]) -> u32 { (b[0].max(b[2]).max(b[4]).max(b[6]) - b[0].min(b[2]).min(b[4]).min(b[6])).ceil() as u32 }
fn crop_height(b: &[f32; 8]) -> u32 { (b[1].max(b[3]).max(b[5]).max(b[7]) - b[1].min(b[3]).min(b[5]).min(b[7])).ceil() as u32 }
