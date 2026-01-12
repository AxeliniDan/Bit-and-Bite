export interface AIConsultResult {
    datos_identificacion: {
        nombre_paciente: string | null
        especie_raza_detectada: string | null
        nombre_dueno: string | null
        peso_detectado: string | null
        es_nuevo_paciente_probable: boolean
    }
    resumen_clinico: {
        motivo_consulta: string
        subjetivo: string
        objetivo: string
        diagnostico_presuntivo: string
        plan_tratamiento: string
    }
}

// --- SYSTEM PROMPTS ---
const SYSTEM_PROMPT_GEMINI = `Actúa como un Motor de Procesamiento de Datos Clínicos Veterinarios experto.
Recibirás una transcripción de texto.
Tu salida debe ser un JSON VÁLIDO unicamente.

ESTRUCTURA JSON REQUERIDA:
{
  "datos_identificacion": {
    "nombre_paciente": "String o null",
    "especie_raza_detectada": "String o null",
    "nombre_dueno": "String o null",
    "peso_detectado": "String o null",
    "es_nuevo_paciente_probable": Boolean
  },
  "resumen_clinico": {
    "motivo_consulta": "String",
    "subjetivo": "String",
    "objetivo": "String",
    "diagnostico_presuntivo": "String",
    "plan_tratamiento": "String"
  }
}`

/**
 * 
 * @param input Text String (WebSpeech + Gemini)
 * @returns 
 */
export async function processVoiceConsultation(input: Blob | string): Promise<AIConsultResult> {
    const isText = typeof input === 'string'
    console.log("Processing consulting...", isText ? "Text Mode" : "Audio Mode", input)

    // --- REAL MODE: GEMINI FLASH (Free Tier) ---
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

    // 1. Validation: API Key
    if (!API_KEY) {
        alert("ERROR: No se encontró la API KEY de Gemini en .env. Por favor configura VITE_GEMINI_API_KEY.")
        throw new Error("Missing API Key")
    }

    // 2. Validation: Input
    // We converting Blob to string description for error if needed
    if (!isText) {
        alert("ERROR: El modo de audio directo (Blob) no está soportado en la versión Free. Usa el modo Texto.")
        throw new Error("Blob input not supported in Free Mode")
    }

    if ((input as string).length < 5) {
        alert("ERROR: El texto es demasiado corto para procesar. Habla más.")
        throw new Error("Input too short")
    }

    // 3. Execution: Call Gemini
    try {
        console.log("Calling Gemini Flash Latest (Stable)...")

        // Updated to 'gemini-1.5-flash' which is the current stable version
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: SYSTEM_PROMPT_GEMINI + "\n\nTRANSCRIPCIÓN:\n" + input
                    }]
                }],
                generationConfig: {
                    response_mime_type: "application/json"
                }
            })
        })

        if (!response.ok) {
            const errText = await response.text()
            console.error("Gemini API Error Body:", errText)
            throw new Error(`API respondió con estatus ${response.status}: ${errText}`)
        }

        const data = await response.json()
        const jsonString = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (jsonString) {
            const cleanJson = jsonString.replace(/```json/g, '').replace(/```/g, '')
            return JSON.parse(cleanJson)
        } else {
            throw new Error("La IA no devolvió ningún texto JSON.")
        }
    } catch (e: unknown) {
        console.error("Gemini Critical Error:", e)
        const msg = e instanceof Error ? e.message : "Unknown AI error"
        alert("CRITICAL AI ERROR:\n" + msg)
        throw e
    }
}


