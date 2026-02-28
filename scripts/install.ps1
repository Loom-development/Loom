param(
  [string]$Repo = $(if ($env:LOOM_REPO) { $env:LOOM_REPO } else { "Loom-development/Loom" }),
  [string]$Version = $(if ($env:LOOM_VERSION) { $env:LOOM_VERSION } else { "latest" }),
  [string]$InstallDir = $(if ($env:LOOM_INSTALL_DIR) { $env:LOOM_INSTALL_DIR } else { "$HOME\\.loom\\bin" })
)

$arch = switch ($env:PROCESSOR_ARCHITECTURE) {
  "AMD64" { "x64" }
  "ARM64" { "arm64" }
  default { throw "Unsupported architecture: $env:PROCESSOR_ARCHITECTURE" }
}

$asset = "loom-windows-$arch.zip"
if ($Version -eq "latest") {
  $url = "https://github.com/$Repo/releases/latest/download/$asset"
} else {
  $url = "https://github.com/$Repo/releases/download/$Version/$asset"
}

$tmp = Join-Path $env:TEMP "loom-install"
if (Test-Path $tmp) { Remove-Item -Path $tmp -Recurse -Force }
New-Item -ItemType Directory -Path $tmp | Out-Null
New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null

$zip = Join-Path $tmp "loom.zip"
Write-Host "Downloading $url"
Invoke-WebRequest -Uri $url -OutFile $zip
Expand-Archive -Path $zip -DestinationPath $tmp -Force
Copy-Item -Path (Join-Path $tmp "loom.cmd") -Destination (Join-Path $InstallDir "loom.cmd") -Force
Copy-Item -Path (Join-Path $tmp "loom.mjs") -Destination (Join-Path $InstallDir "loom.mjs") -Force

$pathUser = [Environment]::GetEnvironmentVariable("Path", "User")
if ($pathUser -notlike "*$InstallDir*") {
  [Environment]::SetEnvironmentVariable("Path", "$pathUser;$InstallDir", "User")
  Write-Host "Added $InstallDir to user PATH"
}

Write-Host "Installed loom to $InstallDir\\loom.cmd"
Write-Host "Open a new terminal and run: loom --help"
