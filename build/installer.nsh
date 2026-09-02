!macro customInit
  ; Terminate any lingering app processes and sleep so NSIS can cleanly replace all binary files (e.g. v8_context_snapshot.bin)
  nsExec::Exec 'taskkill /F /IM "AGR Jewellery Management.exe" /T'
  nsExec::Exec 'taskkill /F /IM "node.exe" /T'
  Sleep 1200

  ReadRegStr $0 HKCU "Software\com.agr.jewellery.desktop" "InstallLocation"
  StrCmp $0 "" 0 set_dir
  ReadRegStr $0 HKLM "Software\com.agr.jewellery.desktop" "InstallLocation"
  StrCmp $0 "" done 0

set_dir:
  StrCpy $INSTDIR $0

done:
!macroend

!macro customInstall
  WriteRegStr HKCU "Software\com.agr.jewellery.desktop" "InstallLocation" "$INSTDIR"
  WriteRegStr HKLM "Software\com.agr.jewellery.desktop" "InstallLocation" "$INSTDIR"
!macroend
