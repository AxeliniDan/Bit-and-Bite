import { useState, useEffect, useRef, useCallback } from "react"

export function useSpeechRecognition() {
    const [isRecording, setIsRecording] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [error, setError] = useState<string | null>(null)

    // Use useRef to persist the recognition instance
    const recognitionRef = useRef<any>(null)

    useEffect(() => {
        // Initialize SpeechRecognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition()
            recognition.continuous = true
            recognition.interimResults = true
            recognition.lang = 'es-ES' // Set to Spanish

            recognition.onresult = (event: any) => {
                let finalTranscript = ''
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript
                    }
                }
                if (finalTranscript) {
                    setTranscript(prev => prev + " " + finalTranscript)
                }
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

    const startRecording = useCallback(() => {
        setTranscript("")
        setError(null)
        if (recognitionRef.current) {
            recognitionRef.current.start()
            setIsRecording(true)
        }
    }, [])

    const stopRecording = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
            setIsRecording(false)
        }
    }, [])

    // Also support Blob recording for fallback if needed, but for now we focus on Text
    // We mock the Blob interface to keep compatibility with existing button logic slightly
    // but better to expose the text directly.

    return {
        isRecording,
        transcript,
        error,
        startRecording,
        stopRecording
    }
}
