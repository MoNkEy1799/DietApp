import subprocess
import re

print("Starting ADB server for port forwarding.")
subprocess.run(["sdk_platform_tools/adb.exe", "start-server"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

# check if a device is successfully connected via usb
result = subprocess.run(["sdk_platform_tools/adb.exe", "devices"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
device_found = False
for line in result.stdout.splitlines():
    tokens = line.decode().split()
    if len(tokens) == 2 and tokens[1] == "device":
        device_found = True
        break
if not device_found:
    print("No authorized device found. Please connect and authorize a device.")
    print("How to install the app on a (android) device:\n"
          "\t1. Change label names for person1 and person2 in index.html (line: 16 & 19).\n"
          "\t2. Activate developer options in settings on device and enable USB-debugging.\n"
          "\t3. Connect phone via USB to PC (install USB driver if necessary) and allow debugging.\n"
          "\t4. Check if USB connection is set to data transfer.\n"
          "\t5. Run 'run_install_server.bat' (this file).\n"
          "\t6. Go to localhost:8000 on phone and install app.")
    exit(1)

# port forwarding
print("Device connected and authorized.")
subprocess.run(["sdk_platform_tools/adb.exe", "reverse", "tcp:8000", "tcp:8000"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
subprocess.run(["sdk_platform_tools/adb.exe", "reverse", "--list"], capture_output=True, text=True)

# add new cache version such that old caches get deleted on activate
with open("sw.js", "r") as file:
    content = file.read()
cache_version = int(re.findall("\\d+", content.split("\n")[0])[0])
with open("sw.js", "w") as file:
    file.write(content.replace(f"v{cache_version}", f"v{cache_version+1}"))

print("Install app under: localhost:8000")
subprocess.run(["python", "-m", "http.server", "8000"], capture_output=True, text=True)
