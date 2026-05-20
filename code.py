import wifi
import socketpool
import ssl
import os
import adafruit_requests
import time
import board
import busio
from adafruit_vl53l0x import VL53L0X

# WiFi connect
print("Verbinding maken met WiFi...")
wifi.radio.connect(
    os.getenv("CIRCUITPY_WIFI_SSID"),
    os.getenv("CIRCUITPY_WIFI_PASSWORD")
)

print("WiFi verbonden!")
print(f"IP Adres: {wifi.radio.ipv4_address}")

# I2C setup voor VL53L0X
i2c = busio.I2C(scl=board.GP17, sda=board.GP16)
sensor = VL53L0X(i2c)

# Socket & Request setup
pool = socketpool.SocketPool(wifi.radio)
ssl_context = ssl.create_default_context()
requests = adafruit_requests.Session(pool, ssl_context)

# Pas dit aan naar je server URL!
url = "http://YOUR_SERVER_IP:5000/data"

print(f"Data wordt verzonden naar: {url}")
print("Sensor aan het meten...")

while True:
    try:
        # Lees sensor uit
        distance = sensor.range
        
        # Maak data pakket
        data = {
            "distance": distance,
            "unit": "mm"
        }
        
        print(f"Afstand: {distance} mm")
        
        # Verzend naar server
        try:
            response = requests.post(url, json=data)
            print(f"Server response: {response.status}")
            response.close()
        except Exception as e:
            print(f"Verzend error: {e}")
    
    except Exception as e:
        print(f"Sensor error: {e}")
    
    # Wacht 10 seconden
    time.sleep(10)
