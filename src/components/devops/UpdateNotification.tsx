import { useEffect, useState } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast"; // Assuming hook exists, if not usage might differ
import { Card } from "@/components/ui/card";
import { Download, RefreshCcw, X } from "lucide-react";

export function UpdateNotification() {
    const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
    const [downloading, setDownloading] = useState<boolean>(false);
    const [readyToInstall, setReadyToInstall] = useState<boolean>(false);
    const [version, setVersion] = useState<string>('');

    useEffect(() => {
        const checkForUpdates = async () => {
            try {
                const update = await check();
                if (update) {
                    console.log(`[Updater] Found update ${update.version} from ${update.date}`);
                    setVersion(update.version);
                    setUpdateAvailable(true);
                }
            } catch (error) {
                console.error('[Updater] Failed to check for updates', error);
            }
        };

        checkForUpdates();
    }, []);

    const handleUpdate = async () => {
        setDownloading(true);
        try {
            const update = await check();
            if (update) {
                await update.downloadAndInstall();
                setReadyToInstall(true);
                setDownloading(false);

                // Optional: Auto restart 
                // await relaunch();
            }
        } catch (error) {
            console.error('[Updater] Failed to download update', error);
            setDownloading(false);
        }
    };

    const handleRestart = async () => {
        await relaunch();
    };

    if (!updateAvailable) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] animate-in slide-in-from-bottom-5 duration-300">
            <Card className="p-4 w-80 shadow-2xl border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                        {readyToInstall ? "Actualización Lista" : "Nueva Versión Disponible"}
                        <span className="text-xs bg-primary/10 text-primary px-1.5 rounded">{version}</span>
                    </h4>
                    <button onClick={() => setUpdateAvailable(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <p className="text-xs text-muted-foreground mb-4">
                    {readyToInstall
                        ? "La actualización se ha descargado. Reinicia para aplicar los cambios."
                        : "Una nueva versión de VetFlow está disponible. Descárgala para obtener las últimas funciones."}
                </p>

                <div className="flex justify-end gap-2">
                    {!readyToInstall ? (
                        <Button size="sm" onClick={handleUpdate} disabled={downloading}>
                            {downloading ? (
                                <>
                                    <RefreshCcw className="mr-2 h-3 w-3 animate-spin" />
                                    Descargando...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-3 w-3" />
                                    Actualizar
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button size="sm" onClick={handleRestart} variant="default" className="bg-green-600 hover:bg-green-700">
                            <RefreshCcw className="mr-2 h-3 w-3" />
                            Reiniciar ahora
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}
