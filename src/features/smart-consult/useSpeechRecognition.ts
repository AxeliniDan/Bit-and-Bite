import { useState, useEffect, useRef, useCallback } from "react"

export function useSpeechRecognition() {
    const [isRecording, setIsRecording] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [error, setError] = useState<string | null>(null)

    const [interimTranscript, setInterimTranscript] = useState("")

    // Use useRef to persist the recognition instance
    const recognitionRef = useRef<null | {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        onresult: (event: { resultIndex: number; results: { length: number;[key: number]: { isFinal: boolean;[key: number]: { transcript: string } } } }) => void;
        onerror: (event: { error: string }) => void;
        start: () => void;
        stop: () => void;
    }>(null)

    useEffect(() => {
        // Initialize SpeechRecognition
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition()
            recognition.continuous = true
            recognition.interimResults = true
            recognition.lang = 'es-ES' // Default

            recognition.onresult = (event: { resultIndex: number; results: SpeechRecognitionResultList }) => {
                let finalTranscript = ''
                let currentInterim = ''

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        finalTranscript += result[0].transcript
                    } else {
                        currentInterim += result[0].transcript
                    }
                }

                if (finalTranscript) {
                    setTranscript(prev => prev + " " + finalTranscript)
                }
                setInterimTranscript(currentInterim)
            }

            recognition.onerror = (event: { error: string }) => {
                console.error("Speech recognition error", event.error)
                setError(event.error)
                setIsRecording(false)
            }

            recognitionRef.current = recognition
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
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
