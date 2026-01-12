import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileUp, AlertTriangle, CheckCircle2 } from "lucide-react"

interface BulkImportModalProps {
    isOpen: boolean
    onClose: () => void
    onImport: (data: Record<string, unknown>[]) => Promise<void>
    title?: string
}

export function BulkImportModal({ isOpen, onClose, onImport, title = "Carga Masiva" }: BulkImportModalProps) {
    const [file, setFile] = useState<File | null>(null)
    const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([])
    const [headers, setHeaders] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith('.csv')) {
            setError("Por favor sube un archivo CSV válido.")
            return
        }

        setFile(selectedFile)
        setError(null)
        parseCSV(selectedFile)
    }

    const parseCSV = (file: File) => {
        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string
                const lines = text.split('\n').filter(line => line.trim() !== '')

                if (lines.length < 2) throw new Error("El archivo parece estar vacío o sin datos.")

                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
                setHeaders(headers)

                const data = lines.slice(1, 6).map(line => { // Preview top 5
                    const values = line.split(',')
                    const row: Record<string, unknown> = {}
                    headers.forEach((header, index) => {
                        row[header] = values[index]?.trim().replace(/"/g, '') || ''
                    })
                    return row
                })

                setPreviewData(data)
            } catch {
                setError("Error al leer el archivo. Verifica el formato.")
            }
        }
        reader.readAsText(file)
    }

    const handleProcess = async () => {
        setIsLoading(true)
        try {
            // In a real scenario we would parse the full file here
            await onImport(previewData)
            onClose()
        } catch {
            setError("Falló la importación. Intenta de nuevo.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Sube un archivo CSV para importar registros masivamente.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {!file ? (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors">
                            <Upload className="h-8 w-8 text-muted-foreground mb-4" />
                            <p className="text-sm font-medium">Arrastra tu archivo aquí</p>
                            <p className="text-xs text-muted-foreground mb-4">o haz clic para buscar (.csv)</p>
                            <Input
                                id="csvFile"
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <Button variant="secondary" onClick={() => document.getElementById('csvFile')?.click()}>
                                Seleccionar Archivo
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                                <FileUp className="h-5 w-5 text-primary" />
                                <span className="font-medium text-sm flex-1 truncate">{file.name}</span>
                                <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Cambiar</Button>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-2 rounded">
                                    <AlertTriangle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            {previewData.length > 0 && !error && (
                                <div className="border rounded-md overflow-hidden">
                                    <div className="bg-muted px-3 py-2 text-xs font-semibold border-b">
                                        Vista Previa ({previewData.length} registros)
                                    </div>
                                    <div className="w-full overflow-auto">
                                        <table className="w-full caption-bottom text-sm">
                                            <thead className="[&_tr]:border-b">
                                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                    {headers.slice(0, 3).map(h => <th key={h} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">{h}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody className="[&_tr:last-child]:border-0">
                                                {previewData.map((row, i) => (
                                                    <tr key={i} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                        {headers.slice(0, 3).map(h => <td key={h} className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{(row[h] as string)}</td>)}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleProcess} disabled={!file || !!error || isLoading}>
                        {isLoading ? (
                            <>Procesando...</>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Procesar Carga
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
