import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Synapse — Nunca mais estude sozinho",
  description:
    "Encontre parceiros de estudo ideais, crie salas com Pomodoro compartilhado e suba no ranking. A rede que faltava na sua faculdade.",
  keywords: ["estudo", "faculdade", "EAD", "study buddy", "pomodoro", "gamificação"],
  openGraph: {
    title: "Synapse — Nunca mais estude sozinho",
    description: "A rede de estudo colaborativo que transforma solidão em conexão.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="font-display bg-dark-900 text-text-primary antialiased">
        <div className="noise-overlay" />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
