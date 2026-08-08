Set WshShell = CreateObject("WScript.Shell")
' Run start.bat with window style 0 (hidden) and waitOnReturn set to false (async)
WshShell.Run "cmd.exe /c start.bat", 0, false
