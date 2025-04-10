@echo off
setlocal enabledelayedexpansion

for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr "IPv4 Address"') do (
    set ip=%%A
)
for /f "tokens=* delims= " %%A in ("!ip!") do set ip=%%A

echo Install app under: http://%ip%:8000
python -m http.server 8000
