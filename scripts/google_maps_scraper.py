
import csv
import time
import requests
import re
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# --- CONFIGURACIÓN ---
TIMEOUT_REQUESTS = 5  # Segundos para esperar a que cargue una web en Fase 2

def get_browser():
    """Configura y retorna una instancia del driver de Chrome."""
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    # options.add_argument("--headless") # Descomentar para ejecutar sin interfaz gráfica
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    return driver

# --- FASE 1: GOOGLE MAPS ---
def scroll_results(driver, max_results=30):
    """Hace scroll en el panel de resultados para cargar más items."""
    try:
        wait = WebDriverWait(driver, 10)
        feed_element = wait.until(EC.presence_of_element_located((By.XPATH, '//div[@role="feed"]')))
        
        print(f"Panel de resultados detectado. Iniciando scroll hasta {max_results} items...")
        
        items_loaded = 0
        last_items_len = 0
        retries = 0
        
        while items_loaded < max_results:
            feed_element.send_keys(Keys.END)
            time.sleep(2) 
            
            elements = driver.find_elements(By.XPATH, '//div[@role="feed"]//a[contains(@href, "/maps/place/")]')
            items_loaded = len(elements)
            print(f"Resultados cargados: {items_loaded}")
            
            if items_loaded == last_items_len:
                retries += 1
                if retries > 3:
                     print("Parece que no hay más resultados o el scroll se atascó.")
                     break
            else:
                retries = 0
                
            last_items_len = items_loaded
            
    except Exception as e:
        print(f"Advertencia durante el scroll: {e}")

# --- FASE 2: EMAIL HUNTER ---
def get_emails_from_url(url):
    """
    Visita la URL usando requests y extrae correos con Regex.
    Retorna una cadena con los emails separados por punto y coma, o vacío.
    """
    if not url:
        return ""
    
    print(f"   Searching emails in: {url} ...")
    try:
        # Headers para parecer un navegador real y evitar bloqueos simples
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=TIMEOUT_REQUESTS)
        
        if response.status_code == 200:
            # Regex para emails
            # Explicación: busca patrones algo@algo.algo
            email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
            
            # Buscamos todas las coincidencias
            found_emails = set(re.findall(email_pattern, response.text))
            
            # Filtros extra básicos para evitar basura (ej. archivos de imagen falsos positivos, etc)
            clean_emails = [e for e in found_emails if not e.endswith(('.png', '.jpg', '.gif', '.css', '.js'))]
            
            if clean_emails:
                print(f"   -> ENCONTRADO: {len(clean_emails)} emails.")
                return "; ".join(clean_emails)
    except Exception as e:
        # Errores comunes: timeout, ssl, connection error. No detenemos el script.
        print(f"   -> Error visitando web: {str(e)[:50]}")
    
    return ""

# --- FASE 3: WHATSAPP FORMATTER ---
def format_whatsapp(phone):
    """
    Limpia el teléfono y genera link de WhatsApp.
    Asume México (+52) si no hay código de país.
    """
    if not phone or "No encontrado" in phone:
        return ""
    
    # 1. Limpieza de caracteres no numéricos excepto '+'
    # Mantenemos el + para saber si ya trae lada
    clean_digits = re.sub(r'[^0-9+]', '', phone)
    
    if not clean_digits:
        return ""
        
    # 2. Lógica de país
    # Si empieza con +, asumimos que ya trae código. Ej: +521664...
    # Si no, agregamos 521 (estándar móvil MX internacionales).
    
    final_number = ""
    
    if clean_digits.startswith('+'):
        final_number = clean_digits.replace('+', '')
    else:
        # Si tiene 10 dígitos (ej. 6641234567), agregamos 521
        if len(clean_digits) == 10:
            final_number = "521" + clean_digits
        else:
            # Si tiene longitud rara, lo dejamos tal cual con 52 por defecto o directo
            # Para ir a la segura, probamos directo, o agregamos 52
            final_number = "52" + clean_digits

    return f"https://wa.me/{final_number}"


def extract_data(driver):
    """Extrae información, busca emails y formatea datos."""
    results = []
    
    # Selectores ajustados
    elements = driver.find_elements(By.XPATH, '//div[@role="feed"]//a[contains(@href, "/maps/place/")]')
    
    print(f"\nProcesando {len(elements)} items para minería profunda...")
    
    for idx, element in enumerate(elements):
        try:
            name = element.get_attribute("aria-label")
            if not name: 
                continue
                
            print(f"[{idx+1}/{len(elements)}] Procesando: {name}")
            
            # Subir al padre para buscar textos
            parent = element.find_element(By.XPATH, "./../..") 
            full_text = parent.text
            lines = full_text.split('\n')
            
            phone = "No encontrado"
            website = "" 
            address = "No detectada"
            
            # Extracción básica de Maps
            try:
                web_btn = parent.find_element(By.XPATH, './/a[@data-value="Sitio web"]')
                website = web_btn.get_attribute("href")
            except:
                pass
            
            # Parser de texto para teléfono y dirección
            for line in lines:
                # Heurística teléfono
                digits = sum(c.isdigit() for c in line)
                if (digits > 6 and "+" in line) or (digits > 8 and digits < 15):
                   if "Abierto" not in line and "Cierra" not in line: 
                       phone = line
                
                # Heurística Dirección (muy básica, si contiene coma y no es el nombre)
                # Google Maps suele poner la direccion cerca del principio
                if "," in line and digits < 3 and line != name and " km" not in line:
                    # Candidato a dirección si no es ridículamente corto
                    if len(line) > 10:
                        address = line

            # --- FASE 2: MINERÍA DE EMAILS ---
            found_emails = "NO WEBSITE"
            has_web = "NO"
            
            if website:
                has_web = "SÍ"
                found_emails = get_emails_from_url(website) # Deep Mining
                if not found_emails:
                    found_emails = "No detectados"

            # --- FASE 3: WHATSAPP ---
            wa_link = format_whatsapp(phone)
            
            results.append({
                "Nombre": name,
                "Teléfono": phone,
                "Sitio Web": website,
                "Emails_Encontrados": found_emails,
                "Link_WhatsApp": wa_link,
                "Dirección": address,
                "Tiene_Web": has_web
            })
            
        except Exception as e:
            print(f"Error parseando item {idx}: {e}")
            continue
            
    return results

def save_to_csv(data, filename="prospectos_veterinarias_pro.csv"):
    if not data:
        print("No se extrajeron datos.")
        return

    # Definir orden de columnas
    fieldnames = ["Nombre", "Teléfono", "Web", "Emails_Encontrados", "Link_WhatsApp", "Dirección", "Tiene_Web"]
    # Mapeo de claves del dict a los headers del CSV
    # Nuestras claves son las mismas, pero aseguramos el orden
    
    try:
        with open(filename, 'w', newline='', encoding='utf-8-sig') as output_file:
            writer = csv.DictWriter(output_file, fieldnames=fieldnames)
            writer.writeheader()
            
            # Escribir filas mapeando los nombres si es necesario, 
            # aqui mis claves coinciden con fieldnames excepto Web->Sitio Web
            
            # Ajuste de datos para coincidir con fieldnames exactos si hay diferencia
            clean_rows = []
            for row in data:
                clean_rows.append({
                    "Nombre": row["Nombre"],
                    "Teléfono": row["Teléfono"],
                    "Web": row["Sitio Web"],
                    "Emails_Encontrados": row["Emails_Encontrados"],
                    "Link_WhatsApp": row["Link_WhatsApp"],
                    "Dirección": row["Dirección"],
                    "Tiene_Web": row["Tiene_Web"]
                })
            
            writer.writerows(clean_rows)
            
        print(f"\n¡Éxito! Datos exportados a: {filename}")
    except IOError:
        print("Error crítico al escribir el archivo CSV (¿está abierto?).")

def main():
    city = input("Ingrese la ciudad para buscar veterinarias: ")
    if not city:
        city = "Ciudad de México" 
    
    query = f"Veterinaria en {city}"
    print(f"--- INICIANDO SCRAPER PROFUNDO: {query} ---")
    
    driver = get_browser()
    
    try:
        driver.get("https://www.google.com/maps")
        wait = WebDriverWait(driver, 10)
        search_box = wait.until(EC.element_to_be_clickable((By.ID, "searchboxinput")))
        search_box.send_keys(query)
        search_box.send_keys(Keys.ENTER)
        
        time.sleep(4) # Espera carga inicial
        
        # FASE 1: Scroll
        scroll_results(driver, max_results=25)
        
        # FASE 2 & 3: Extracción e Inteligencia
        data = extract_data(driver)
        
        # Exportar
        save_to_csv(data)
        
    except Exception as e:
        print(f"Error global: {e}")
    finally:
        driver.quit()
        print("Navegador cerrado.")

if __name__ == "__main__":
    main()
