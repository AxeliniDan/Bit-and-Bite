import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
    items: {
        href: string
        title: string
        icon?: React.ComponentType<{ className?: string }>
    }[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
    const location = useLocation()

    return (
        <nav
            className={cn(
                "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
                className
            )}
            {...props}
        >
            {items.map((item) => {
                const isActive = location.pathname === item.href

                return (
                    <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                            buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
                            "justify-start",
                            isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50",
                            "transition-all duration-200"
                        )}
                    >
                        {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                        {item.title}
                    </Link>
                )
            })}
        </nav>
    )
}
