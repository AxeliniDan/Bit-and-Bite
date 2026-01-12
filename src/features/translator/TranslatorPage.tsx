import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useSpeechRecognition } from "@/features/smart-consult/useSpeechRecognition"
import { Mic, MicOff, Languages, Volume2, ArrowRightLeft, ShieldAlert } from "lucide-react"

// --- Quick Phrases Data ---
const QUICK_PHRASES = [
    { icon: "🧪", label: "Laboratorio", es: "Vamos a realizar análisis de sangre.", en: "We are going to run some blood tests." },
    { icon: "💀", label: "Rayos X", es: "Necesitamos tomar unas radiografías.", en: "We need to take some X-rays." },
    { icon: "🍽️", label: "Ayuno", es: "Debe mantener ayuno de 8 horas.", en: "Needs to fast for 8 hours." },
    { icon: "💊", label: "Medicación", es: "Dele este medicamento cada 12 horas.", en: "Give this medication every 12 hours." },
    { icon: "📅", label: "Cita", es: "Necesitamos verlo en una semana.", en: "We need to see him in a week." },
]

// --- Translation Service (Inline for now to keep it self-contained) ---
async function translateText(text: string, targetLang: 'es' | 'en'): Promise<string> {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
    if (!API_KEY) throw new Error("Missing API Key")

    const prompt = `Act like a professional Veterinary Translator.
    
    You will receive text that was dictated via voice recognition. It may contain phonetic errors or "sounds-like" mistakes (e.g., "fewer" instead of "fever").
    
    TASK:
    1. Infer the intended veterinary/medical meaning even if valid words are used incorrectly.
    2. Translate the CORRECTED meaning to ${targetLang === 'es' ? 'Spanish' : 'English'}.
    3. Maintain professional veterinary terminology.

    Input Text: "${text}"
    
    Output ONLY the translated text, nothing else.`

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        })

        if (!response.ok) {
            const errorData = await response.text()
            console.error("Gemini API Error:", errorData)
            throw new Error(`API Error: ${response.status} - ${errorData}`)
        }

        const data = await response.json()
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Error: No translation found."
    } catch (error: any) {
        console.error("Translation Request Failed:", error)
        return `Error: ${error.message || "Unknown error"}`
    }
}

export function TranslatorPage() {
    const [mode, setMode] = useState<'es-to-en' | 'en-to-es'>('es-to-en')
    const { isRecording, transcript, interimTranscript, startRecording, stopRecording, resetTranscript } = useSpeechRecognition()
    const [lastTranslatedText, setLastTranslatedText] = useState("")
    const [isTranslating, setIsTranslating] = useState(false)
    const [history, setHistory] = useState<{ original: string, translated: string, direction: string }[]>([])

    // Trigger translation when recording stops and we have a transcript
    useEffect(() => {
        if (!isRecording && transcript.trim().length > 0) {
            handleTranslation(transcript)
        }
    }, [isRecording, transcript])

    const handleTranslation = async (text: string) => {
        setIsTranslating(true)
        try {
            const targetLang = mode === 'es-to-en' ? 'en' : 'es'
            const result = await translateText(text, targetLang)
            setLastTranslatedText(result)

            // Add to history
            setHistory(prev => [{ original: text, translated: result, direction: mode }, ...prev])

            // Auto-speak result
            speak(result, targetLang)
        } catch (e: any) {
            console.error(e)
            alert(e.message || "Translation Error")
        } finally {
            setIsTranslating(false)
        }
    }

    const speak = (text: string, lang: 'es' | 'en') => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = lang === 'es' ? 'es-ES' : 'en-US'
        window.speechSynthesis.speak(utterance)
    }

    const toggleMode = () => {
        setMode(prev => prev === 'es-to-en' ? 'en-to-es' : 'es-to-en')
        setLastTranslatedText("")
        resetTranscript()
    }

    const handleQuickPhrase = (phrase: typeof QUICK_PHRASES[0]) => {
        const sourceText = mode === 'es-to-en' ? phrase.es : phrase.en
        const targetText = mode === 'es-to-en' ? phrase.en : phrase.es
        const targetLang = mode === 'es-to-en' ? 'en' : 'es'

        // Set states instantly
        resetTranscript() // Clear any existing recording text
        setLastTranslatedText(targetText)

        // Add to history (simulating a translation)
        setHistory(prev => [{ original: sourceText, translated: targetText, direction: mode }, ...prev])

        // Speak result
        speak(targetText, targetLang)
    }

    // Check for API Key
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 p-4 max-w-4xl mx-auto">
            {!apiKey && (
                <div className="bg-destructive/15 text-destructive border border-destructive/20 p-4 rounded-md flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5" />
                    <div>
                        <p className="font-bold">Missing API Key</p>
                        <p className="text-sm">Please config VITE_GEMINI_API_KEY in your environment variables or GitHub Secrets.</p>
                    </div>
                </div>
            )}

            <header className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Languages className="text-primary" />
                    Veterinary Translator
                </h1>
                <Button variant="outline" size="sm" onClick={() => setHistory([])}>Clear History</Button>
            </header>

            {/* Main Interactive Area */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Input Card */}
                <Card className={`p-6 flex flex-col items-center justify-center text-center gap-6 border-2 ${isRecording ? 'border-primary animate-pulse' : 'border-border'}`}>
                    <h3 className="text-lg font-semibold text-muted-foreground uppercase tracking-wider">
                        {mode === 'es-to-en' ? 'Español (Hable ahora)' : 'English (Speak now)'}
                    </h3>

                    <div className="flex-1 flex items-center justify-center w-full relative">
                        {(!isRecording && !transcript) && (
                            <p className="text-2xl font-medium text-foreground/40 absolute">
                                {apiKey ? "Presione el micrófono" : "API Key Required"}
                            </p>
                        )}
                        <p className="text-2xl font-medium text-foreground/80 break-words w-full px-4">
                            {transcript}
                            <span className="opacity-50 transition-opacity duration-150">{interimTranscript}</span>
                        </p>
                    </div>

                    <Button
                        size="icon"
                        className={`h-20 w-20 rounded-full shadow-xl transition-all ${isRecording ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-primary hover:bg-primary/90'}`}
                        onClick={isRecording ? stopRecording : () => startRecording(mode === 'es-to-en' ? 'es-ES' : 'en-US')}
                        disabled={!apiKey}
                    >
                        {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                    </Button>
                </Card>

                {/* Output Card */}
                <Card className="p-6 flex flex-col items-center justify-center text-center gap-6 bg-muted/30">
                    <h3 className="text-lg font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        {mode === 'es-to-en' ? 'English' : 'Español'}
                        <Button variant="ghost" size="icon" onClick={toggleMode} title="Switch Languages">
                            <ArrowRightLeft className="h-4 w-4" />
                        </Button>
                    </h3>

                    <div className="flex-1 flex items-center justify-center w-full">
                        {isTranslating ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        ) : (
                            <p className="text-2xl font-medium text-primary">
                                {lastTranslatedText || "Translation will appear here..."}
                            </p>
                        )}
                    </div>

                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-12 w-12 rounded-full"
                        onClick={() => lastTranslatedText && speak(lastTranslatedText, mode === 'es-to-en' ? 'en' : 'es')}
                        disabled={!lastTranslatedText}
                    >
                        <Volume2 className="h-6 w-6" />
                    </Button>
                </Card>
            </div>

            {/* Quick Phrases */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {QUICK_PHRASES.map((phrase, idx) => (
                    <Button
                        key={idx}
                        variant="outline"
                        className="h-auto py-2 px-3 flex flex-col items-center gap-1 text-xs hover:bg-primary/10 hover:border-primary transition-colors"
                        onClick={() => handleQuickPhrase(phrase)}
                    >
                        <span className="text-lg">{phrase.icon}</span>
                        <span className="font-medium text-center leading-tight">{phrase.label}</span>
                    </Button>
                ))}
            </div>

            {/* History / Recent */}
            <div className="h-1/3 overflow-y-auto border-t pt-4">
                <h4 className="text-sm font-semibold text-muted-foreground mb-4">Recent Translations</h4>
                <div className="space-y-3">
                    {history.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 bg-card rounded-lg border text-sm">
                            <span className="font-medium flex-1">{item.original}</span>
                            <ArrowRightLeft className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="font-medium text-primary flex-1 text-right">{item.translated}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
