@echo off
setlocal enabledelayedexpansion

echo Starting ADB server for port forwarding.
sdk_platform_tools\adb.exe start-server > nul 2>&1
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
sdk_platform_tools\adb.exe reverse tcp:8000 tcp:8000 > nul 2>&1
echo Port forwarding:
sdk_platform_tools\adb.exe reverse --list

echo Install app under: localhost:8000
python -m http.server 8000
