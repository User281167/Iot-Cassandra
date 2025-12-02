import urequests
import network
import json
import time
import math
from machine import ADC, Pin
from machine import Timer
import machine


w = network.WLAN(network.STA_IF)

# -------- CONFIGURACIÓN ----------
PIR_PIN = 32
Ultrasonic_PIN_TRIG = 12
Ultrasonic_PIN_ECHO = 14

pir = Pin(PIR_PIN, Pin.IN)
trig = Pin(Ultrasonic_PIN_TRIG, Pin.OUT)
echo = Pin(Ultrasonic_PIN_ECHO, Pin.IN)

url = "https://iot-db-distribuida-252092889958.us-central1.run.app/readings"
headers = {
    "Content-Type": "application/json"
}

sending_pir = False
sending_echo = False


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


def read_pir(timer):
    print(f'PIR value = {pir.value()}')


def send_pir(timer):
    global sending_pir
 
    if sending_pir:
        return

    print("Enviando valor PIR")

    sending_pir = True
    data = {
        "sede": "UTP",
        "sensor_type": "motion",
        "sensor_id": "U-PIR-1",
        "value": pir.value()
    }

    try:
        response = urequests.post(url, data=json.dumps(data), headers=headers)
        print("Pir res code", response.status_code)
        print("Pir res", response.text)
        response.close()
    except Exception as e:
        print("Error enviando valor PIR", e)
    finally:
        sending_pir = False


def measure_distance():
    # Pulso
    trig.value(0)
    time.sleep_us(2)
    trig.value(1)
    time.sleep_us(10)
    trig.value(0)

    # Echo
    try:
        duration = machine.time_pulse_us(echo, 1, 30000)  # 30ms timeout ~ 5m range
        
        if duration < 0:
            return None  # Out of range
        
        distance_cm = duration / 58
        distance_in = duration / 148

        return distance_cm, distance_in
    except OSError:
        return None


def get_measure_distance(timer):
    print(f"Echo (CM/IN) = {measure_distance()}")


def send_measure_distance(timer):
    global sending_echo
 
    if sending_echo:
        return

    print("Enviando valor Echo")

    sending_echo = True
    data = {
        "sede": "UTP",
        "sensor_type": "measure",
        "sensor_id": "U-ECHO-1",
        "value": measure_distance()[0]
    }

    try:
        response = urequests.post(url, data=json.dumps(data), headers=headers)
        print("Echo res code", response.status_code)
        print("Echo res", response.text)
        response.close()
    except Exception as e:
        print("Error enviando valor Echo", e)
    finally:
        sending_echo = False


def main():
    connect_wifi()

    # Movimiento leer y enviar
    tim_pir = Timer(0)
    tim_pir.init(mode=Timer.PERIODIC, period=1000, callback=read_pir)

    tim_pir_send = Timer(1)
    tim_pir_send.init(mode=Timer.PERIODIC, period=20200, callback=send_pir)

    # Echo leer y enviar
    tim_echo = Timer(2)
    tim_echo.init(mode=Timer.PERIODIC, period=1000, callback=get_measure_distance)

    tim_echo_send = Timer(3)
    tim_echo_send.init(mode=Timer.PERIODIC, period=1500, callback=send_measure_distance)

    while True:
        connect_wifi()
        time.sleep(1)


if __name__ == "__main__":
    main()
