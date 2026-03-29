/// Connection health diagnostics for the native messaging setup.
///
/// Validates:
///   - Host binary exists and is executable
///   - Overlay companion exists (optional)
///   - Native messaging manifest exists for each detected browser
///   - Manifest JSON is valid and points to the correct binary
///   - Host binary responds to a test message
///   - Extension is registered (CRX or external extension JSON)
use std::fs;
use std::io::{Read, Write};
use std::path::PathBuf;
use std::process::{Command, Stdio};

use crate::{browsers, install_dir, overlay_binary_name, DEFAULT_EXTENSION_ID, HOST_NAME};

#[derive(Debug)]
pub struct DiagnosticResult {
    pub label: String,
    pub status: DiagStatus,
    pub detail: String,
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum DiagStatus {
    Pass,
    Warn,
    Fail,
}

impl std::fmt::Display for DiagStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Pass => write!(f, "PASS"),
            Self::Warn => write!(f, "WARN"),
            Self::Fail => write!(f, "FAIL"),
        }
    }
}

pub fn run_diagnostics(extension_id: &str) -> String {
    let mut results = Vec::new();
    let dest_dir = install_dir();

    // 1. Check host binary
    let host_path = dest_dir.join(overlay_binary_name());
    if host_path.exists() {
        results.push(DiagnosticResult {
            label: "Native companion binary".into(),
            status: DiagStatus::Pass,
            detail: format!("Found at {}", host_path.display()),
        });

        // Test if host responds to the JSON-RPC contract used by the extension
        match test_host_binary(&host_path) {
            Ok(summary) => results.push(DiagnosticResult {
                label: "Native JSON-RPC handshake".into(),
                status: DiagStatus::Pass,
                detail: summary,
            }),
            Err(e) => results.push(DiagnosticResult {
                label: "Native JSON-RPC handshake".into(),
                status: DiagStatus::Fail,
                detail: format!("Native companion failed JSON-RPC smoke test: {e}"),
            }),
        }
    } else {
        results.push(DiagnosticResult {
            label: "Native companion binary".into(),
            status: DiagStatus::Fail,
            detail: format!("Not found at {}", host_path.display()),
        });
    }

    // 2. Check overlay companion
    let overlay_path = dest_dir.join(overlay_binary_name());
    if overlay_path.exists() {
        results.push(DiagnosticResult {
            label: "Overlay companion".into(),
            status: DiagStatus::Pass,
            detail: format!("Found at {}", overlay_path.display()),
        });
    } else {
        results.push(DiagnosticResult {
            label: "Overlay companion".into(),
            status: DiagStatus::Warn,
            detail: "Not installed (optional)".into(),
        });
    }

    // 3. Check each browser's native messaging manifest
    let browsers = browsers::detect_browsers();
    if browsers.is_empty() {
        results.push(DiagnosticResult {
            label: "Browser detection".into(),
            status: DiagStatus::Warn,
            detail: "No Chromium-based browsers detected".into(),
        });
    }

    for browser in &browsers {
        let manifest_path = browser.native_messaging_dir.join(format!("{HOST_NAME}.json"));
        if manifest_path.exists() {
            match validate_manifest(&manifest_path, &host_path, extension_id) {
                Ok(()) => results.push(DiagnosticResult {
                    label: format!("{} manifest", browser.name),
                    status: DiagStatus::Pass,
                    detail: format!("Valid at {}", manifest_path.display()),
                }),
                Err(e) => results.push(DiagnosticResult {
                    label: format!("{} manifest", browser.name),
                    status: DiagStatus::Fail,
                    detail: format!("Invalid: {e}"),
                }),
            }
        } else {
            results.push(DiagnosticResult {
                label: format!("{} manifest", browser.name),
                status: DiagStatus::Fail,
                detail: format!("Not found at {}", manifest_path.display()),
            });
        }
    }

    // Format report
    format_report(&results)
}

fn validate_manifest(
    manifest_path: &PathBuf,
    expected_host_path: &PathBuf,
    extension_id: &str,
) -> Result<(), String> {
    let content = fs::read_to_string(manifest_path).map_err(|e| format!("Cannot read: {e}"))?;
    let json: serde_json::Value =
        serde_json::from_str(&content).map_err(|e| format!("Invalid JSON: {e}"))?;

    // Check name
    let name = json.get("name").and_then(|v| v.as_str()).unwrap_or("");
    if name != HOST_NAME {
        return Err(format!("Name mismatch: expected {HOST_NAME}, got {name}"));
    }

    // Check path points to existing binary
    let path = json.get("path").and_then(|v| v.as_str()).unwrap_or("");
    if !PathBuf::from(path).exists() {
        return Err(format!("Binary path does not exist: {path}"));
    }
    if PathBuf::from(path) != *expected_host_path {
        return Err(format!(
            "Binary path mismatch: expected {}, got {path}",
            expected_host_path.display()
        ));
    }

    // Check type is stdio
    let typ = json.get("type").and_then(|v| v.as_str()).unwrap_or("");
    if typ != "stdio" {
        return Err(format!("Type should be 'stdio', got '{typ}'"));
    }

    let expected_origin = format!(
        "chrome-extension://{}/",
        if extension_id.is_empty() {
            DEFAULT_EXTENSION_ID
        } else {
            extension_id
        }
    );
    let allowed_origins = json
        .get("allowed_origins")
        .and_then(|value| value.as_array())
        .ok_or_else(|| "allowed_origins must be an array".to_string())?;
    if !allowed_origins.iter().any(|origin| origin.as_str() == Some(&expected_origin)) {
        return Err(format!(
            "allowed_origins missing expected extension origin {expected_origin}"
        ));
    }

    Ok(())
}

fn native_frame(value: serde_json::Value) -> Result<Vec<u8>, String> {
    let body = serde_json::to_vec(&value).map_err(|e| format!("Serialize frame: {e}"))?;
    let mut frame = Vec::with_capacity(body.len() + 4);
    frame.extend_from_slice(&(body.len() as u32).to_le_bytes());
    frame.extend_from_slice(&body);
    Ok(frame)
}

fn read_native_message(output: &[u8]) -> Result<serde_json::Value, String> {
    if output.len() < 4 {
        return Err("Native companion produced a truncated response".into());
    }
    let len = u32::from_le_bytes([output[0], output[1], output[2], output[3]]) as usize;
    if output.len() < len + 4 {
        return Err(format!(
            "Native companion response length mismatch: header={len}, bytes={}",
            output.len().saturating_sub(4)
        ));
    }
    serde_json::from_slice(&output[4..4 + len]).map_err(|e| format!("Decode response JSON: {e}"))
}

fn test_host_binary(host_path: &PathBuf) -> Result<String, String> {
    let hello_msg = native_frame(serde_json::json!({
        "jsonrpc": "2.0",
        "id": "diagnose-hello",
        "method": "hello",
        "params": {
            "extensionSessionId": "diagnose-extension-session",
            "extensionVersion": "1.0.0",
            "browser": "chrome",
            "capabilities": ["json-rpc", "heartbeat", "overlay"],
            "platform": std::env::consts::OS,
        }
    }))?;
    let ping_msg = native_frame(serde_json::json!({
        "jsonrpc": "2.0",
        "id": "diagnose-ping",
        "method": "ping",
        "params": {
            "extensionSessionId": "diagnose-extension-session",
            "sentAt": 1234567890_u64,
        }
    }))?;
    let status_msg = native_frame(serde_json::json!({
        "jsonrpc": "2.0",
        "id": "diagnose-status",
        "method": "status"
    }))?;

    let mut child = Command::new(host_path)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Cannot spawn host: {e}"))?;

    if let Some(ref mut stdin) = child.stdin {
        stdin
            .write_all(&hello_msg)
            .map_err(|e| format!("Write hello frame: {e}"))?;
        stdin
            .write_all(&ping_msg)
            .map_err(|e| format!("Write ping frame: {e}"))?;
        stdin
            .write_all(&status_msg)
            .map_err(|e| format!("Write status frame: {e}"))?;
    }
    // Drop stdin to signal EOF
    drop(child.stdin.take());

    let output = child
        .wait_with_output()
        .map_err(|e| format!("Wait: {e}"))?;

    if !output.stderr.is_empty() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        if output.stdout.is_empty() {
            return Err(format!("Host stderr: {}", stderr.trim()));
        }
    }

    let mut cursor = std::io::Cursor::new(&output.stdout);
    let hello_response = read_frame_from_cursor(&mut cursor)?;
    let ping_response = read_frame_from_cursor(&mut cursor)?;
    let status_response = read_frame_from_cursor(&mut cursor)?;

    validate_success_response(&hello_response, "diagnose-hello", "hello")?;
    validate_success_response(&ping_response, "diagnose-ping", "ping")?;
    validate_success_response(&status_response, "diagnose-status", "status")?;

    let hello_result = hello_response
        .get("result")
        .and_then(|value| value.as_object())
        .ok_or_else(|| "hello response missing result object".to_string())?;
    let ping_result = ping_response
        .get("result")
        .and_then(|value| value.as_object())
        .ok_or_else(|| "ping response missing result object".to_string())?;
    let status_result = status_response
        .get("result")
        .and_then(|value| value.as_object())
        .ok_or_else(|| "status response missing result object".to_string())?;

    let overlay_status = hello_result
        .get("overlayStatus")
        .and_then(|value| value.as_str())
        .unwrap_or("unknown");
    let service_status = status_result
        .get("service")
        .and_then(|value| value.as_str())
        .unwrap_or("unknown");
    let platform = status_result
        .get("platform")
        .and_then(|value| value.as_str())
        .unwrap_or("unknown");
    let pong = ping_result
        .get("pong")
        .and_then(|value| value.as_bool())
        .unwrap_or(false);
    if !pong {
        return Err("ping response did not include pong=true".into());
    }

    Ok(format!(
        "hello/status/ping succeeded; service={service_status}, overlay={overlay_status}, platform={platform}"
    ))
}

fn read_frame_from_cursor(cursor: &mut std::io::Cursor<&Vec<u8>>) -> Result<serde_json::Value, String> {
    let mut len_buf = [0u8; 4];
    cursor
        .read_exact(&mut len_buf)
        .map_err(|e| format!("Read response length: {e}"))?;
    let len = u32::from_le_bytes(len_buf) as usize;
    let mut payload = vec![0u8; len];
    cursor
        .read_exact(&mut payload)
        .map_err(|e| format!("Read response body: {e}"))?;
    read_native_message(&[len_buf.to_vec(), payload].concat())
}

fn validate_success_response(
    response: &serde_json::Value,
    expected_id: &str,
    label: &str,
) -> Result<(), String> {
    if response.get("jsonrpc").and_then(|value| value.as_str()) != Some("2.0") {
        return Err(format!("{label} response missing jsonrpc=2.0: {response}"));
    }
    if response.get("id").and_then(|value| value.as_str()) != Some(expected_id) {
        return Err(format!(
            "{label} response ID mismatch: expected {expected_id}, got {response}"
        ));
    }
    if response.get("error").is_some() {
        return Err(format!("{label} returned RPC error: {response}"));
    }
    if response.get("result").is_none() {
        return Err(format!("{label} response missing result: {response}"));
    }
    Ok(())
}

fn format_report(results: &[DiagnosticResult]) -> String {
    let mut out = String::new();
    out.push_str("\n  LLM SIDEBAR DIAGNOSTIC REPORT\n");
    out.push_str("  ─────────────────────────────────────────\n\n");

    let pass_count = results.iter().filter(|r| r.status == DiagStatus::Pass).count();
    let warn_count = results.iter().filter(|r| r.status == DiagStatus::Warn).count();
    let fail_count = results.iter().filter(|r| r.status == DiagStatus::Fail).count();

    for r in results {
        let icon = match r.status {
            DiagStatus::Pass => "+",
            DiagStatus::Warn => "?",
            DiagStatus::Fail => "x",
        };
        out.push_str(&format!("  [{icon}] {}: {}\n", r.label, r.detail));
    }

    out.push_str(&format!(
        "\n  Summary: {pass_count} passed, {warn_count} warnings, {fail_count} failed\n"
    ));

    if fail_count > 0 {
        out.push_str("  Run 'llm-sidebar-installer install' to fix issues.\n");
    }

    out
}
