
import smtplib
import pandas as pd
import time
import random
import os
import sys
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# --- CONFIGURACIÓN DE CORREO ---
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "tadeod2020@gmail.com" 
SENDER_PASSWORD = "abjbpqigrdgwffwk" # App Password configurada

# --- ARCHIVOS ---
CSV_FILE = "prospectos_veterinarias_pro.csv" # Usamos el generado anteriormente
LOG_FILE = "scripts/email_log.txt"

def load_sent_emails():
    """Carga los emails a los que ya se les envió correo."""
    if not os.path.exists(LOG_FILE):
        return set()
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        return set(line.strip() for line in f)

def log_sent_email(email):
    """Registra un email como enviado."""
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"{email}\n")

def send_email(to_email, business_name, server):
    """Envía el correo personalizado."""
    subject = f"Pregunta para el equipo de {business_name}"
    
    # CUERPO DEL MENSAJE (HTML simple)
    body = f"""
    <html>
    <body>
        <p>Hola equipo de <b>{business_name}</b>,</p>
        
        <p>Espero que estén teniendo una excelente semana.</p>
        
        <p>Soy Tadeo, estudiante de ingeniería y desarrollador de software. He creado un sistema diseñado específicamente para veterinarias que ayuda a gestionar pacientes e historial clínico de forma muy sencilla.</p>
        
        <p>Me gustaría mucho mostrarles una demo rápida sin ningún compromiso, ya que estoy buscando feedback de expertos como ustedes.</p>
        
        <p>¿Tendrían 5 minutos esta semana?</p>
        
        <p>Saludos cordiales,<br>
        Tadeo</p>
    </body>
    </html>
    """
    
    msg = MIMEMultipart()
    msg["From"] = SENDER_EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject
    
    msg.attach(MIMEText(body, "html"))
    
    try:
        server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"   [ERROR] Falló envío a {to_email}: {e}")
        return False

def main():
    print("--- INICIANDO AUTOMATIZACIÓN DE CORREOS ---")
    
    # 1. Validar CSV
    if not os.path.exists(CSV_FILE):
        print(f"[ERROR] No se encontró el archivo {CSV_FILE}. Generalo primero con el scraper.")
        sys.exit(1)
        
    try:
        df = pd.read_csv(CSV_FILE)
    except Exception as e:
        print(f"[ERROR] No se pudo leer el CSV: {e}")
        sys.exit(1)
        
    # Verificar columnas
    required_cols = ["Nombre", "Emails_Encontrados"]
    for col in required_cols:
        if col not in df.columns:
            print(f"[ERROR] Columna faltante en CSV: {col}")
            sys.exit(1)
            
    # 2. Cargar historial
    sent_emails_history = load_sent_emails()
    print(f"Historial cargado: {len(sent_emails_history)} correos ya contactados anteriormente.")
    
    # 3. Conexión SMTP
    print(f"Conectando a {SMTP_SERVER}...")
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        print("¡Conexión SMTP exitosa!")
    except Exception as e:
        print(f"[ERROR DE CONEXIÓN] Revisa tus credenciales. Recuerda usar una 'App Password' de Google.\nDetalle: {e}")
        sys.exit(1)
        
    count_sent = 0
    count_failed = 0
    count_skipped = 0
    
    # 4. Iteración
    try:
        for index, row in df.iterrows():
            business_name = str(row["Nombre"]).strip()
            raw_emails = str(row["Emails_Encontrados"])
            
            # Validaciones básicas
            if not raw_emails or raw_emails.lower() in ["nan", "no detectados", "no website", ""]:
                continue
                
            # Puede haber múltiples emails separados por ;
            email_list = [e.strip() for e in raw_emails.split(";")]
            
            for email in email_list:
                if not email or "@" not in email:
                    continue
                    
                if email in sent_emails_history:
                    count_skipped += 1
                    # print(f"Skipping {email} (ya enviado).")
                    continue
                
                print(f"\n[{index+1}] Enviando a: {business_name} ({email})...")
                
                if send_email(email, business_name, server):
                    print("   -> ¡Enviado correctamente!")
                    log_sent_email(email)
                    sent_emails_history.add(email)
                    count_sent += 1
                    
                    # ANTI-SPAM DELAY
                    delay = random.randint(60, 180)
                    print(f"   -> Esperando {delay} segundos para evitar spam...")
                    time.sleep(delay)
                else:
                    count_failed += 1
                    
    except KeyboardInterrupt:
        print("\n[!] Proceso interrumpido por el usuario.")
    except Exception as e:
        print(f"\n[ERROR CRÍTICO] {e}")
    finally:
        server.quit()
        print("\n" + "="*30)
        print("REPORTE FINAL")
        print(f"Enviados: {count_sent}")
        print(f"Fallidos: {count_failed}")
        print(f"Omitidos (ya enviados): {count_skipped}")
        print("="*30)

if __name__ == "__main__":
    main()
