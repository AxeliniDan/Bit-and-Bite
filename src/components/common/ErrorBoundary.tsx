import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        // TODO: Send to Sentry
        // Sentry.captureException(error);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
                    <div className="bg-destructive/10 p-4 rounded-full mb-6">
                        <AlertCircle className="h-10 w-10 text-destructive" />
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight mb-2">Algo salió mal</h1>
                    <p className="text-muted-foreground max-w-md mb-8">
                        El sistema ha detectado un error inesperado. Hemos notificado al equipo de ingeniería.
                    </p>

                    <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs text-left w-full max-w-lg overflow-auto max-h-32 mb-8 border border-border">
                        {this.state.error?.toString()}
                    </div>

                    <div className="flex gap-4">
                        <Button onClick={this.handleReload} variant="default">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Recargar Sistema
                        </Button>
                        <Button variant="outline" onClick={() => this.setState({ hasError: false })}>
                            Intentar recuperar
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
