$TargetFile = "d:\SONSİTELERİM\19-tarihoyunugoogleaı\1-TIKLA-YAYINLA.bat"
$ShortcutFile = "$env:USERPROFILE\Desktop\TARIHSELI_YAYINLA.lnk"
$WScriptShell = New-Object -ComObject WScript.Shell
$Shortcut = $WScriptShell.CreateShortcut($ShortcutFile)
$Shortcut.TargetPath = $TargetFile
$Shortcut.WorkingDirectory = "d:\SONSİTELERİM\19-tarihoyunugoogleaı"
$Shortcut.IconLocation = "shell32.dll,43"
$Shortcut.Save()
Write-Host "Kısayol Masaüstüne Oluşturuldu: TARIHSELI_YAYINLA"
