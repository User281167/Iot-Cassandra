from machine import ADC, Pin
import urequests
import network
import json
import time
import math


w = network.WLAN(network.STA_IF)

# -------- CONFIGURACIÓN ----------
NTC_PIN = 32   # pin analógico del NTC
LDR_PIN = 16   # GPIO16
BETA = 3950

adc = ADC(Pin(NTC_PIN))
ldr = Pin(LDR_PIN, Pin.IN)

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


def read_temperature():
    ntc_value = adc.read()
    
    if ntc_value == 0:
        return None

    voltage = ntc_value * (5.0 / 4095.0)

    # Fórmula Beta (Steinhart)
    celsius = 1 / (math.log(1 / (4095.0 / ntc_value - 1)) / BETA + 1.0 / 298.15) - 273.15

    return ntc_value, celsius


def send_ldr():
    if not send_values:
        return

    print("Enviando valor LDR")

    data = {
        "sede": "Pereira Centro",
        "sensor_type": "photoresistor",
        "sensor_id": "PC-PHOTO1",
        "value": float(ldr.value())
    }

    try:
        response = urequests.post(url, data=json.dumps(data), headers=headers)
        print(response.status_code)
        print(response.text)
        response.close()
    except Exception as e:
        print("Error enviando valor LDR", e)


def send_temp(temp):
    if not send_values:
        return

    print("Enviando valor Temperatura")

    data = {
        "sede": "Pereira Centro",
        "sensor_type": "temperature",
        "sensor_id": "PC-TEMP1",
        "value": float(temp)
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

    print("Estado LDR:", "Dark" if ldr.value() == 1 else "Light")
    data = read_temperature()

    if data:
        ntc_value, temp_c = data
        print("NTC =", ntc_value, " -> Temperatura =", round(temp_c, 2), "°C")
        
        send_temp(round(temp_c, 2))
    else:
        print("Lectura de temperatura inválida")

    send_ldr()
    update_ticks()
    time.sleep(sleep_dt)
