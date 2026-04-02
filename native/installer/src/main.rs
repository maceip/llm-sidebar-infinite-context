/// Installer for LLM Sidebar Chrome extension + native messaging host.
///
/// Supports both CLI and GUI modes:
///   llm-sidebar-installer install   [--extension-id ID]
///   llm-sidebar-installer uninstall [--extension-id ID]
///   llm-sidebar-installer diagnose
///   llm-sidebar-installer gui       (launches the setup wizard)
///
/// Features:
///   - Detects all installed Chromium-based browsers
///   - Registers native messaging host for each detected browser
///   - Installs the CRX via Chrome's external extension mechanism
///   - Diagnoses and validates existing installations
///   - GUI setup wizard (egui) for guided installation
mod browsers;
mod diagnose;

use std::env;
use std::fs;
use std::path::{Path, PathBuf};

pub const HOST_NAME: &str = "com.maceip.native_overlay_companion";
pub const DEFAULT_EXTENSION_ID: &str = "hecgmgkofmopdcjlbaegcaanaadhomhb";

fn main() {
    let args: Vec<String> = env::args().collect();

    let command = args.get(1).map(|s| s.as_str()).unwrap_or("gui");
    let extension_id = args
        .iter()
        .position(|a| a == "--extension-id")
        .and_then(|i| args.get(i + 1))
        .map(|s| s.as_str())
        .unwrap_or(DEFAULT_EXTENSION_ID);

    match command {
        "install" => {
            if let Err(e) = install(extension_id) {
                eprintln!("Install failed: {e}");
                std::process::exit(1);
            }
            println!("
Installation complete.");
        }
        "uninstall" => {
            if let Err(e) = uninstall() {
                eprintln!("Uninstall failed: {e}");
                std::process::exit(1);
            }
            println!("Uninstall complete.");
        }
        "diagnose" => {
            let report = diagnose::run_diagnostics(extension_id);
            println!("{report}");
        }
        "gui" => {
            #[cfg(feature = "gui")]
            {
                gui::run_wizard();
            }
            #[cfg(not(feature = "gui"))]
            {
                eprintln!("GUI not enabled. Rebuild with --features gui, or use: llm-sidebar-installer install");
                std::process::exit(1);
            }
        }
        _ => {
            eprintln!("Usage: llm-sidebar-installer [install|uninstall|diagnose|gui] [--extension-id ID]");
            std::process::exit(1);
        }
    }
}

#[cfg(feature = "gui")]
mod gui;

pub fn install_dir() -> PathBuf {
    if cfg!(windows) {
        let local_app = env::var("LOCALAPPDATA").unwrap_or_else(|_| {
            let home = env::var("USERPROFILE").expect("USERPROFILE not set");
            format!(r"{home}\AppData\Local")
        });
        PathBuf::from(local_app).join("LLMSidebar")
    } else {
        let home = env::var("HOME").expect("HOME not set");
        PathBuf::from(home).join(".local/share/llm-sidebar")
    }
}

pub fn host_binary_name() -> &'static str {
    if cfg!(windows) {
        "overlay-companion.exe"
    } else {
        "overlay-companion"
    }
}

pub fn overlay_binary_name() -> &'static str {
    if cfg!(windows) {
        "overlay-companion.exe"
    } else {
        "overlay-companion"
    }
}

pub fn find_adjacent_binary(name: &str) -> Option<PathBuf> {
    let exe = env::current_exe().ok()?;
    let dir = exe.parent()?;

    let candidates = [
        dir.join(name),
        dir.join(".").join(name),
        dir.join("..").join(name),
        dir.join("..").join("overlay-companion").join(name),
        dir.join("..").join("overlay-companion").join("target").join("debug").join(name),
    ];

    candidates.into_iter().find(|candidate| candidate.exists())
}

pub fn find_crx() -> Option<PathBuf> {
    let exe = env::current_exe().ok()?;
    let dir = exe.parent()?;
    for entry in fs::read_dir(dir).ok()? {
        let entry = entry.ok()?;
        let path = entry.path();
        if path.extension().map(|e| e == "crx").unwrap_or(false) {
            return Some(path);
        }
    }
    None
}

/// Find the unpacked extension directory (dist/) adjacent to the installer.
pub fn find_unpacked_extension() -> Option<PathBuf> {
    let exe = env::current_exe().ok()?;
    let dir = exe.parent()?;

    // Check for an "extension" subfolder first, then "dist"
    let candidates = [
        dir.join("extension"),
        dir.join("dist"),
    ];

    for candidate in &candidates {
        if candidate.join("manifest.json").exists() {
            return Some(candidate.clone());
        }
    }

    // Check if manifest.json is right next to the installer (flat layout)
    if dir.join("manifest.json").exists() {
        return Some(dir.to_path_buf());
    }

    None
}

/// Copy an entire directory recursively.
fn copy_dir_recursive(src: &Path, dst: &Path) -> Result<(), Box<dyn std::error::Error>> {
    fs::create_dir_all(dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());
        if src_path.is_dir() {
            copy_dir_recursive(&src_path, &dst_path)?;
        } else {
            fs::copy(&src_path, &dst_path)?;
        }
    }
    Ok(())
}

/// Get the path where the unpacked extension is installed.
pub fn extension_install_path() -> PathBuf {
    install_dir().join("extension")
}

pub fn install(extension_id: &str) -> Result<InstallReport, Box<dyn std::error::Error>> {
    let dest_dir = install_dir();
    fs::create_dir_all(&dest_dir)?;

    let mut report = InstallReport::default();

    let host_src = find_adjacent_binary(host_binary_name())
        .ok_or("Cannot find overlay-companion binary next to installer")?;
    let host_dest = dest_dir.join(host_binary_name());
    println!("  Copying native companion host to {}", host_dest.display());
    fs::copy(&host_src, &host_dest)?;
    set_executable(&host_dest);
    report.host_installed = true;
    report.overlay_installed = true;

    // Copy installer itself as uninstaller
    if let Ok(self_exe) = env::current_exe() {
        let uninstaller_name = if cfg!(windows) { "uninstall.exe" } else { "uninstall" };
        let uninstaller_dest = dest_dir.join(uninstaller_name);
        if let Err(e) = fs::copy(&self_exe, &uninstaller_dest) {
            eprintln!("  WARNING: Could not copy uninstaller: {e}");
        } else {
            set_executable(&uninstaller_dest);
            println!("  Uninstaller copied to {}", uninstaller_dest.display());
        }
    }

    if let Some(overlay_src) = find_adjacent_binary(overlay_binary_name()) {
        let overlay_dest = dest_dir.join(overlay_binary_name());
        if overlay_src != overlay_dest {
            println!("  Copying overlay companion to {}", overlay_dest.display());
            fs::copy(&overlay_src, &overlay_dest)?;
            set_executable(&overlay_dest);
        }
        report.overlay_installed = true;
    }

    // 2. Detect browsers and register native messaging host for each
    let detected = browsers::detect_browsers();
    if detected.is_empty() {
        println!("  WARNING: No Chromium-based browsers detected.");
    }

    let manifest = serde_json::json!({
        "name": HOST_NAME,
        "description": "Native overlay companion host for LLM Sidebar Chrome extension",
        "path": host_dest.to_string_lossy(),
        "type": "stdio",
        "allowed_origins": [format!("chrome-extension://{extension_id}/")]
    });
    let manifest_json = serde_json::to_string_pretty(&manifest)?;

    for browser in &detected {
        match browsers::register_native_host(browser, &manifest_json) {
            Ok(path) => {
                println!("  Registered native host for {} at {}", browser.name, path.display());
                report.browsers_registered.push(browser.name.clone());
            }
            Err(e) => {
                eprintln!("  WARNING: Failed to register for {}: {e}", browser.name);
                report.browser_errors.push((browser.name.clone(), e.to_string()));
            }
        }
    }

    // 3. Install CRX extension
    if let Some(crx_path) = find_crx() {
        install_crx(&crx_path, extension_id, &dest_dir)?;
        report.crx_installed = true;
    } else {
        println!("  No .crx found next to installer, skipping extension install.");
    }

    Ok(report)
}

pub fn uninstall() -> Result<(), Box<dyn std::error::Error>> {
    let dest_dir = install_dir();
    let detected = browsers::detect_browsers();
    for browser in &detected {
        if let Err(e) = browsers::unregister_native_host(browser) {
            eprintln!("  WARNING: Failed to unregister from {}: {e}", browser.name);
        } else {
            println!("  Unregistered from {}", browser.name);
        }
    }

    if dest_dir.exists() {
        println!("  Removing {}", dest_dir.display());
        fs::remove_dir_all(&dest_dir)?;
    }

    Ok(())
}

#[derive(Default, Debug, Clone)]
pub struct InstallReport {
    pub host_installed: bool,
    pub overlay_installed: bool,
    pub crx_installed: bool,
    pub extension_installed: bool,
    pub extension_path: Option<PathBuf>,
    pub browsers_registered: Vec<String>,
    pub browser_errors: Vec<(String, String)>,
}

fn set_executable(path: &Path) {
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let _ = fs::set_permissions(path, fs::Permissions::from_mode(0o755));
    }
}

#[cfg(unix)]
fn install_crx(crx_path: &Path, extension_id: &str, dest_dir: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let crx_dest = dest_dir.join("llm-sidebar.crx");
    fs::copy(crx_path, &crx_dest)?;

    let ext_dir = if cfg!(target_os = "macos") {
        let home = env::var("HOME")?;
        PathBuf::from(home).join("Library/Application Support/Google/Chrome/External Extensions")
    } else {
        let home = env::var("HOME")?;
        PathBuf::from(home).join(".config/google-chrome/External Extensions")
    };
    fs::create_dir_all(&ext_dir)?;

    let ext_json = serde_json::json!({
        "external_crx": crx_dest.to_string_lossy(),
        "external_version": "1.0"
    });
    let ext_path = ext_dir.join(format!("{extension_id}.json"));
    println!("  Registering external extension at {}", ext_path.display());
    fs::write(&ext_path, serde_json::to_string_pretty(&ext_json)?)?;
    Ok(())
}

#[cfg(windows)]
fn install_crx(crx_path: &Path, extension_id: &str, dest_dir: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let crx_dest = dest_dir.join("llm-sidebar.crx");
    fs::copy(crx_path, &crx_dest)?;
    println!("  CRX copied to {}", crx_dest.display());

    use winreg::enums::*;
    use winreg::RegKey;

    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    // Point to the local HTTP server in the overlay companion daemon
    let update_url = "http://127.0.0.1:17532/update.xml";
    let force_value = format!("{extension_id};{update_url}");

    // Use ExtensionInstallForcelist policy for each browser — this actually works
    // for sideloading CRX on modern Chrome/Edge/Brave
    let policy_paths = [
        r"Software\Policies\Google\Chrome\ExtensionInstallForcelist",
        r"Software\Policies\Microsoft\Edge\ExtensionInstallForcelist",
        r"Software\Policies\BraveSoftware\Brave-Browser\ExtensionInstallForcelist",
    ];

    for policy_path in &policy_paths {
        let (key, _) = hkcu.create_subkey(policy_path)?;
        // Find next available numeric slot
        let mut slot = 1u32;
        loop {
            match key.get_value::<String, _>(slot.to_string()) {
                Ok(existing) if existing.starts_with(extension_id) => break, // already registered
                Err(_) => break, // empty slot
                Ok(_) => slot += 1, // occupied by another extension
            }
        }
        key.set_value(slot.to_string(), &force_value)?;
        println!("  Registered extension policy in HKCU\\{policy_path}");
    }

    // Also write the legacy external extension keys as fallback
    let legacy_paths = [
        format!(r"Software\Google\Chrome\Extensions\{extension_id}"),
        format!(r"Software\Microsoft\Edge\Extensions\{extension_id}"),
    ];

    for path in &legacy_paths {
        let (key, _) = hkcu.create_subkey(path)?;
        key.set_value("path", &crx_dest.to_string_lossy().to_string())?;
        key.set_value("version", &"1.0")?;
    }

    Ok(())
}
