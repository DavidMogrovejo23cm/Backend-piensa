import qrcode
import base64
from io import BytesIO
import requests
import secrets
import string
from datetime import datetime, timedelta

def generate_token(length=32):
    """Genera un token aleatorio seguro"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_qr_token_data():
    """Genera los datos para el QR token"""
    # Generar token único
    token = generate_token()
    
    # Crear QR con el token
    img = qrcode.make(token)
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    # Fechas
    now = datetime.now()
    expires_in = now + timedelta(hours=1)  # Expira en 1 hora
    
    return {
        "token": token,
        "empleado_id": 1,  # ID del empleado (cambiar según necesites)
        "creado_en": now.isoformat(),
        "expira_en": expires_in.isoformat(),
        "usado": False,
        "qrCode": img_base64  # Campo adicional para el QR en base64
    }

# Generar datos del QR token
qr_data = generate_qr_token_data()

print("Datos generados:")
print(f"Token: {qr_data['token']}")
print(f"Empleado ID: {qr_data['empleado_id']}")
print(f"Creado en: {qr_data['creado_en']}")
print(f"Expira en: {qr_data['expira_en']}")
print(f"Usado: {qr_data['usado']}")
print(f"QR Code (base64): {qr_data['qrCode'][:50]}...")

# Enviar al backend
try:
    res = requests.post("http://localhost:3000/qrtoken", json=qr_data)
    print(f"\nRespuesta del servidor:")
    print(f"Status: {res.status_code}")
    print(f"Respuesta: {res.text}")
except requests.exceptions.RequestException as e:
    print(f"Error al enviar al backend: {e}")