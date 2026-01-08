import { ArrowRight, Code2, Heart, Rocket, ShieldCheck, User } from "lucide-react";
import { Link } from "react-router-dom";

export const AboutPage = () => {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
            {/* Navigation Bar (Simple) */}
            <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <img
                            src="/logo.png"
                            alt="Bit and Bite Logo"
                            className="h-8 w-8 object-contain"
                        />
                        <span className="text-xl font-bold tracking-tight">Bit and Bite</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm font-medium">
                        <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">
                            Iniciar Sesión
                        </Link>
                        <Link
                            to="/login"
                            className="rounded-full bg-primary px-4 py-2 text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
                        >
                            Comenzar Ahora
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-24 pb-20">
                {/* Hero Section - Bit and Bite */}
                <section className="container mx-auto mb-32 px-6">
                    <div className="mx-auto max-w-4xl text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="mb-6 inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                            <span className="mr-2 flex h-2 w-2">
                                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                            </span>
                            Tu clínica en piloto automático
                        </div>
                        <h1 className="mb-8 text-5xl font-extrabold tracking-tight sm:text-7xl bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                            Empoderar a las clínicas veterinarias
                        </h1>
                        <p className="mb-10 text-xl text-muted-foreground sm:text-2xl leading-relaxed">
                            <span className="font-semibold text-foreground">Bit and Bite</span> es la conexión entre dos mundos. Ofrecemos ingeniería de clase mundial adaptada a la realidad local: automatización 100% por WhatsApp, soporte en tu idioma y precios justos.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link
                                to="/login"
                                className="group flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-105"
                            >
                                Prueba la Demo
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <a
                                href="#developer"
                                className="flex h-12 items-center justify-center gap-2 rounded-full border bg-background px-8 text-base font-medium shadow-sm transition-colors hover:bg-muted/50"
                            >
                                Conoce al Creador
                            </a>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="container mx-auto mb-32 px-6">
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                icon: Rocket,
                                title: "Eficiencia Binacional",
                                desc: "Tecnología diseñada para operar fluidamente en la dinámica de la frontera (Español/Inglés).",
                            },
                            {
                                icon: ShieldCheck,
                                title: "Seguridad Blindada",
                                desc: "Protección de datos de nivel bancario para asegurar que la información de cada clínica esté tan segura como en una bóveda digital.",
                            },
                            {
                                icon: Heart,
                                title: "Simplicidad Radical",
                                desc: "Software potente que no requiere manual de usuario; si sabes usar WhatsApp, sabes usar Bit and Bite.",
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="group relative overflow-hidden rounded-2xl border bg-card/50 p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                <feature.icon className="mb-4 h-10 w-10 text-primary" />
                                <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Developer Section */}
                <section id="developer" className="relative border-t bg-muted/20 py-32">
                    <div className="container mx-auto px-6">
                        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
                            <div className="relative order-2 lg:order-1 animate-in slide-in-from-left duration-700 delay-200">
                                {/* Decorative Blobs */}
                                <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl opacity-50" />
                                <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl opacity-50" />

                                <div className="relative overflow-hidden rounded-3xl border bg-card p-2 shadow-2xl">
                                    {/* Placeholder for Profile Image if the user wants to add one later */}
                                    <div className="aspect-[4/5] w-full rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 object-cover flex items-center justify-center text-muted-foreground">
                                        <User className="h-32 w-32 opacity-20" />
                                    </div>
                                </div>
                            </div>

                            <div className="order-1 lg:order-2">
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm font-medium shadow-sm">
                                    <Code2 className="h-4 w-4 text-primary" />
                                    <span className="bg-gradient-to-r from-indigo-500 to-primary bg-clip-text text-transparent font-bold">
                                        Founder & Lead Software Engineer
                                    </span>
                                </div>
                                <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
                                    Hola, soy Tadeo.
                                </h2>
                                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                                    <p>
                                        Creciendo en Tijuana, siempre admiré el talento médico de nuestra región, pero noté un problema recurrente: excelentes doctores perdían horas valiosas de su día jugando a ser secretarios.
                                    </p>
                                    <p>
                                        Como ingeniero, escribí el código de <strong className="text-foreground">Bit and Bite</strong> con una meta clara: crear una recepcionista digital incansable que permitiera a los doctores enfocarse en salvar vidas.
                                    </p>
                                    <p>
                                        <span className="italic block mt-4 border-l-4 border-primary pl-4">
                                            "Orgullosamente sonorense, visionario tecnológico y firme creyente de que la innovación no tiene fronteras."
                                        </span>
                                    </p>
                                </div>

                                <div className="mt-10 flex gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-bold text-foreground">Exp.</span>
                                        <span className="text-sm text-muted-foreground">Cloud & Sec</span>
                                    </div>
                                    <div className="h-12 w-px bg-border mx-4" />
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-bold text-foreground">100%</span>
                                        <span className="text-sm text-muted-foreground">Automation</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t bg-background py-12">
                <div className="container mx-auto px-6 text-center text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Bit and Bite. Todos los derechos reservados.</p>
                    <p className="mt-2 text-sm">Diseñado y desarrollado con ❤️ por Tadeo.</p>
                </div>
            </footer>
        </div>
    );
};
