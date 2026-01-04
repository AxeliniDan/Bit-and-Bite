import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
    title: string
    description: string
    icon: LucideIcon
    action?: React.ReactNode
    className?: string
}

export function EmptyState({ title, description, icon: Icon, action, className }: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8 text-center animate-in fade-in-50 zoom-in-95 duration-500", className)}>
            <div className="rounded-full bg-muted p-4 mb-4 ring-1 ring-border shadow-sm">
                <Icon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-foreground mb-1">
                {title}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
                {description}
            </p>
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    )
}
