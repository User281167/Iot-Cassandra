#!/usr/bin/env python3
"""
Script para probar los endpoints de la API
"""
import httpx
import json

# URL base - cambiar según necesites
BASE_URL = "http://localhost:8000"
# BASE_URL = "https://iot-db-distribuida-252092889958.us-central1.run.app"

def test_endpoints():
    """Prueba los endpoints principales de la API"""
    client = httpx.Client(timeout=10.0)
    
    print("=" * 60)
    print("Probando endpoints de la API IoT")
    print("=" * 60)
    
    # 1. Probar endpoint raíz
    print("\n1. GET /")
    try:
        response = client.get(f"{BASE_URL}/")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # 2. Probar /sedes
    print("\n2. GET /sedes")
    try:
        response = client.get(f"{BASE_URL}/sedes")
        print(f"   Status: {response.status_code}")
        sedes = response.json()
        print(f"   Sedes encontradas: {len(sedes)}")
        print(f"   Sedes: {sedes}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # 3. Probar /docs (documentación)
    print("\n3. GET /docs")
    try:
        response = client.get(f"{BASE_URL}/docs")
        print(f"   Status: {response.status_code}")
        print(f"   Documentación disponible en: {BASE_URL}/docs")
    except Exception as e:
        print(f"   Error: {e}")
    
    # 4. Si hay sedes, probar sensor_types
    print("\n4. GET /sensor_types")
    try:
        response = client.get(f"{BASE_URL}/sedes")
        sedes = response.json()
        if sedes:
            sede = sedes[0]
            response = client.get(f"{BASE_URL}/sensor_types", params={"sede": sede})
            print(f"   Status: {response.status_code}")
            sensor_types = response.json()
            print(f"   Sensor types para '{sede}': {sensor_types}")
        else:
            print("   No hay sedes disponibles para probar")
    except Exception as e:
        print(f"   Error: {e}")
    
    client.close()
    print("\n" + "=" * 60)
    print("Pruebas completadas")
    print("=" * 60)

if __name__ == "__main__":
    test_endpoints()

