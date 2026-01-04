import { useState, useRef, useCallback } from "react"

export interface AudioRecorderState {
    isRecording: boolean
    recordingTime: number
    audioBlob: Blob | null
}

export function useAudioRecorder() {
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data)
                }
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                setAudioBlob(blob)

                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.start()
            setIsRecording(true)

            // Start Timer
            const startTime = Date.now()
            timerRef.current = setInterval(() => {
                setRecordingTime(Math.floor((Date.now() - startTime) / 1000))
            }, 1000)

        } catch (error) {
            console.error("Error accessing microphone:", error)
            alert("No se pudo acceder al micrófono. Por favor verifica los permisos.")
        }
    }, [])

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        }
    }, [isRecording])

    const resetRecording = useCallback(() => {
        setAudioBlob(null)
        setRecordingTime(0)
    }, [])

    return {
        isRecording,
        recordingTime,
        audioBlob,
        startRecording,
        stopRecording,
        resetRecording
    }
}
