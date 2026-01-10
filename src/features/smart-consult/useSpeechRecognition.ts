import { useState, useEffect, useRef, useCallback } from "react"

export function useSpeechRecognition() {
    const [isRecording, setIsRecording] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [error, setError] = useState<string | null>(null)

    const [interimTranscript, setInterimTranscript] = useState("")

    // Use useRef to persist the recognition instance
    const recognitionRef = useRef<any>(null)

    useEffect(() => {
        // Initialize SpeechRecognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition()
            recognition.continuous = true
            recognition.interimResults = true
            recognition.lang = 'es-ES' // Default

            recognition.onresult = (event: any) => {
                let finalTranscript = ''
                let currentInterim = ''

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript
                    } else {
                        currentInterim += event.results[i][0].transcript
                    }
                }

                if (finalTranscript) {
                    setTranscript(prev => prev + " " + finalTranscript)
                }
                setInterimTranscript(currentInterim)
            }

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error)
                setError(event.error)
                setIsRecording(false)
            }

            recognitionRef.current = recognition
        } else {
            setError("Browser not supported")
        }
    }, [])

    const startRecording = useCallback((lang: string = 'es-ES') => {
        setTranscript("")
        setInterimTranscript("")
        setError(null)
        if (recognitionRef.current) {
            recognitionRef.current.lang = lang
            recognitionRef.current.start()
            setIsRecording(true)
        }
    }, [])

    const stopRecording = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
            setIsRecording(false)
            setInterimTranscript("") // Clear interim on stop
        }
    }, [])

    const resetTranscript = useCallback(() => {
        setTranscript("")
        setInterimTranscript("")
        setError(null)
    }, [])

    return {
        isRecording,
        transcript,
        interimTranscript,
        error,
        startRecording,
        stopRecording,
        resetTranscript
    }
}
