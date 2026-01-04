import * as React from "react"
import { Calendar, CreditCard, Settings, Smile, User } from "lucide-react"
import { Command } from "cmdk"
// We'll define a dialog wrapper since Shadcn's cmdk implementation usually wraps it in a Dialog
// For now, I'll create a clean implementation styled directly.

export function CommandPalette() {
    const [open, setOpen] = React.useState(false)

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
            <div className="w-full max-w-[450px]" onClick={(e) => e.stopPropagation()}>
                <Command className="rounded-lg border shadow-md bg-white overflow-hidden">
                    <div className="flex items-center border-b px-3 max-h-14">
                        <Smile className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Command.Input
                            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Escribe un comando o busca..."
                        />
                    </div>
                    <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                        <Command.Empty className="py-6 text-center text-sm">No se encontraron resultados.</Command.Empty>
                        <Command.Group heading="Sugerencias" className="text-xs font-bold text-muted-foreground px-2 py-1.5">
                            <Command.Item className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>Agenda Principal</span>
                            </Command.Item>
                            <Command.Item className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                <User className="mr-2 h-4 w-4" />
                                <span>Buscar Paciente</span>
                            </Command.Item>
                            <Command.Item className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                <CreditCard className="mr-2 h-4 w-4" />
                                <span>Nueva Venta</span>
                            </Command.Item>
                        </Command.Group>
                        <Command.Separator className="-mx-1 h-px bg-border" />
                        <Command.Group heading="Ajustes" className="text-xs font-bold text-muted-foreground px-2 py-1.5">
                            <Command.Item className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Configuración de Clínica</span>
                            </Command.Item>
                        </Command.Group>
                    </Command.List>
                </Command>
            </div>
        </div>
    )
}
