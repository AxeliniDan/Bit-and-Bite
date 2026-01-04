import { useState, useRef, useEffect } from "react"
import { Mic, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSpeechRecognition } from "./useSpeechRecognition"
import { processVoiceConsultation, AIConsultResult } from "./aiConsultService"
import { VoiceResolutionDialog } from "./VoiceResolutionDialog"

export function VoiceMicButton() {
    const { isRecording, startRecording, stopRecording, transcript } = useSpeechRecognition()

    // Keep a ref to transcript to access in setTimeout
    const transcriptRef = useRef(transcript)
    useEffect(() => { transcriptRef.current = transcript }, [transcript])

    const [isProcessing, setIsProcessing] = useState(false)
    const [result, setResult] = useState<AIConsultResult | null>(null)
    const [showDialog, setShowDialog] = useState(false)

    const handleStop = async () => {
        stopRecording()

        // Use a short delay to allow final recognition results
        setTimeout(() => {
            const finalTranscript = transcriptRef.current
            console.log("DEBUG: Final Transcript to Process:", finalTranscript)
            handleProcess(finalTranscript)
        }, 1000)
    }

    const handleProcess = async (textToProcess: string) => {
        if (!textToProcess) {
            console.log("DEBUG: Text is empty.")
            // Might trigger mock if service allows it, but let's log it
        }

        setIsProcessing(true)
        setShowDialog(true)

        try {
            const data = await processVoiceConsultation(textToProcess)
            setResult(data)
        } catch (error) {
            console.error("AI Error:", error)
            alert("Error procesando.")
            setShowDialog(false)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">


                {isRecording && (
                    <div className="bg-black/80 text-white px-3 py-1 rounded-full text-xs font-mono animate-pulse flex items-center gap-2 max-w-[200px] truncate">
                        <span>Escuchando...</span>
                        <span className="opacity-50 italic">{transcript.slice(-15)}</span>
                    </div>
                )}

                <Button
                    size="icon"
                    className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-300 ${isRecording ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    onClick={isRecording ? handleStop : startRecording}
                >
                    {isRecording ? (
                        <Square className="h-6 w-6 fill-current" />
                    ) : (
                        <Mic className="h-6 w-6" />
                    )}
                </Button>
            </div>

            <VoiceResolutionDialog
                open={showDialog}
                onOpenChange={setShowDialog}
                result={result}
                isLoading={isProcessing}
            />
        </>
    )
}
