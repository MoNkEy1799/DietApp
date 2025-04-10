@echo off
setlocal enabledelayedexpansion

echo Starting ADB server...
sdk_platform_tools\adb.exe start-server
set DEVICE_FOUND=
for /f "tokens=1,2" %%a in ('sdk_platform_tools\adb.exe devices') do (
    if "%%b"=="device" (
        set DEVICE_FOUND=1
    )
)
if not defined DEVICE_FOUND (
    echo No authorized device found. Please connect and authorize a device. Check 'install.txt'.
    pause
    exit
)
echo Device connected and authorized.

echo Install app under: localhost:8000
python -m http.server 8000
