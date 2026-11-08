@echo off
rem Softty Office CLI launcher for the packaged Windows app: <install>\resources\cli\genoffice.cmd
setlocal
set ELECTRON_RUN_AS_NODE=1
if exist "%~dp0..\..\Softty Office.exe" (
  "%~dp0..\..\Softty Office.exe" "%~dp0genoffice.cjs" %*
) else (
  "%~dp0..\..\GenOffice.exe" "%~dp0genoffice.cjs" %*
)
endlocal
