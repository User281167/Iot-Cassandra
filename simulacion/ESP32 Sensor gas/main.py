from machine import ADC, Pin
import urequests
import network
import json
import time
import math


w = network.WLAN(network.STA_IF)

# -------- CONFIGURACIÓN ----------
GAS_PIN = 32   # pin analógico


gas_adc = ADC(Pin(GAS_PIN))

# Calibración lineal
M = 31.25
B = -26343.65

url = "https://iot-db-distribuida-252092889958.us-central1.run.app/readings"
headers = {
    "Content-Type": "application/json"
}

sleep_dt = 1
TICKS = sleep_dt * 30 # guardar 2 veces por minuto
ticks = TICKS
send_values = False


def update_ticks():
    global ticks, send_values

    ticks -= 1
    send_values = ticks == 0

    if send_values:
        ticks = TICKS


def connect_wifi():
    if w.isconnected():
        return

    ssid = "Wokwi-GUEST"
    password = ""
    w.active(True)

    if not w.isconnected():
        print("Connecting to WiFi…")
        w.connect(ssid, password)
        while not w.isconnected():
            time.sleep(0.5)

    print("Connected! IP:", w.ifconfig()[0])


def read_gas():
    val = gas_adc.read()
    ppm = M * val + B

    if ppm < 0:
        ppm = 0
    
    return val, ppm


def send_gas(val):
    if not send_values:
        return

    print("Enviando valor LDR")

    data = {
        "sede": "Restaurante CUBA",
        "sensor_type": "gas",
        "sensor_id": "RC-GASPPM",
        "value": val
    }

    try:
        response = urequests.post(url, data=json.dumps(data), headers=headers)
        print(response.status_code)
        print(response.text)
        response.close()
    except Exception as e:
        print("Error enviando valor LDR", e)


while True:
    connect_wifi()

    adc_val, gas_ppm = read_gas()
    print("ADC =", adc_val, "→", round(gas_ppm, 2), "ppm (en partes por millón)")

    send_gas(gas_ppm)
    update_ticks()
    time.sleep(sleep_dt)
