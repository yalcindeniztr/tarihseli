$TargetFile = "D:\tarihselipanel\1-TIKLA-YAYINLA.bat"

# 1. Try Standard Desktop
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutFile = Join-Path $DesktopPath "TARIHSELI_YAYINLA.lnk"
$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut($ShortcutFile)
$Shortcut.TargetPath = $TargetFile
$Shortcut.WorkingDirectory = "D:\tarihselipanel"
$Shortcut.IconLocation = "shell32.dll,43"
$Shortcut.Save()
Write-Host "Kısayol oluşturuldu: $ShortcutFile"

# 2. Try OneDrive Desktop explicitly (common issue)
$OneDriveDesktop = "$env:USERPROFILE\OneDrive\Desktop"
if (Test-Path $OneDriveDesktop) {
    $ShortcutFileOneDrive = Join-Path $OneDriveDesktop "TARIHSELI_YAYINLA.lnk"
    $ShortcutOD = $WScriptShell.CreateShortcut($ShortcutFileOneDrive)
    $ShortcutOD.TargetPath = $TargetFile
    $ShortcutOD.WorkingDirectory = "D:\tarihselipanel"
    $ShortcutOD.IconLocation = "shell32.dll,43"
    $ShortcutOD.Save()
    Write-Host "Kısayol (OneDrive) oluşturuldu: $ShortcutFileOneDrive"
}

# 3. Try Local User Desktop explicitly
$LocalDesktop = "$env:USERPROFILE\Desktop"
if (Test-Path $LocalDesktop) {
    $ShortcutFileLocal = Join-Path $LocalDesktop "TARIHSELI_YAYINLA.lnk"
    $ShortcutLocal = $WScriptShell.CreateShortcut($ShortcutFileLocal)
    $ShortcutLocal.TargetPath = $TargetFile
    $ShortcutLocal.WorkingDirectory = "D:\tarihselipanel"
    $ShortcutLocal.IconLocation = "shell32.dll,43"
    $ShortcutLocal.Save()
    Write-Host "Kısayol (Local) oluşturuldu: $ShortcutFileLocal"
}
