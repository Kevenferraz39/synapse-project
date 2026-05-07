"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerWithEmail, loginWithGoogle } from "@/lib/auth-service";

const SUBJECTS = [
  "Algoritmos", "Cálculo", "Física", "Química", "Estatística",
  "Programação", "Banco de Dados", "Redes", "IA/ML", "UX/UI",
  "Marketing", "Administração", "Direito", "Contabilidade",
  "Psicologia", "Engenharia", "Medicina", "Biologia",
  "Economia", "Sociologia",
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [schedule, setSchedule] = useState({
    morning: false, afternoon: false, evening: true, night: false,
    weekdays: true, weekends: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function toggleSubject(subject: string) {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : prev.length < 8
        ? [...prev, subject]
        : prev
    );
  }

  function toggleSchedule(key: keyof typeof schedule) {
    setSchedule((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleRegister() {
    setError("");
    setLoading(true);
    try {
      await registerWithEmail(email, password, name);
      router.push("/dashboard");
    } catch (err: any) {
      if (err?.code === "auth/email-already-in-use") {
        setError("Este e-mail já está em uso.");
        setStep(1);
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user") {
        setError("Erro ao fazer login com Google.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-up">
      {/* Mobile logo */}
      <div className="flex items-center gap-3 mb-6 lg:hidden">
        <div className="w-10 h-10 rounded-xl bg-gradient-main flex items-center justify-center text-lg font-black text-white">
          S
        </div>
        <span className="text-xl font-black">Synapse</span>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: step >= s ? "100%" : "0%",
                background: "linear-gradient(135deg, #FF6200, #F7145E, #8C52FF)",
              }}
            />
          </div>
        ))}
      </div>

      {/* Step 1: Account */}
      {step === 1 && (
        <div className="animate-fade-up">
          <h1 className="text-3xl font-bold mb-2">Criar conta</h1>
          <p className="text-text-secondary mb-8">
            Comece sua jornada de estudo colaborativo
          </p>

          <button
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-text-primary font-medium text-sm hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 disabled:opacity-50 mb-6"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-text-muted font-medium">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Nome completo</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} className="input-field" />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-brand-pink/10 border border-brand-pink/20 text-brand-pink text-sm">{error}</div>
            )}

            <button
              onClick={() => {
                if (name && email && password.length >= 6) setStep(2);
                else setError("Preencha todos os campos corretamente.");
              }}
              className="w-full btn-gradient py-3.5 text-sm"
            >
              Continuar →
            </button>
          </div>

          <p className="text-center text-sm text-text-muted mt-6">
            Já tem uma conta?{" "}
            <Link href="/auth/login" className="text-brand-purple hover:text-brand-mint font-medium transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      )}

      {/* Step 2: University Info */}
      {step === 2 && (
        <div className="animate-fade-up">
          <h1 className="text-3xl font-bold mb-2">Sobre você</h1>
          <p className="text-text-secondary mb-8">
            Isso nos ajuda a encontrar os melhores parceiros de estudo
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Universidade</label>
              <input type="text" value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="Ex: USP, UNICAMP, Anhanguera..." className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Curso</label>
              <input type="text" value={course} onChange={(e) => setCourse(e.target.value)} placeholder="Ex: Engenharia de Software" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Semestre atual</label>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSemester(s)}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      semester === s
                        ? "bg-brand-purple text-white"
                        : "bg-white/[0.04] border border-white/10 text-text-secondary hover:border-brand-purple/40"
                    }`}
                  >
                    {s}º
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Matérias de interesse <span className="text-text-muted">({selectedSubjects.length}/8)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => toggleSubject(subject)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      selectedSubjects.includes(subject)
                        ? "bg-brand-purple text-white"
                        : "bg-white/[0.04] border border-white/10 text-text-secondary hover:border-brand-purple/40"
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="btn-ghost py-3 px-6 text-sm">
                ← Voltar
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 btn-gradient py-3.5 text-sm"
              >
                Continuar →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Schedule */}
      {step === 3 && (
        <div className="animate-fade-up">
          <h1 className="text-3xl font-bold mb-2">Seus horários</h1>
          <p className="text-text-secondary mb-8">
            Quando você costuma estudar? Isso melhora o match.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-3">Turnos preferidos</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "morning" as const, label: "🌅 Manhã", desc: "6h — 12h" },
                  { key: "afternoon" as const, label: "☀️ Tarde", desc: "12h — 18h" },
                  { key: "evening" as const, label: "🌆 Noite", desc: "18h — 22h" },
                  { key: "night" as const, label: "🌙 Madrugada", desc: "22h — 2h" },
                ].map(({ key, label, desc }) => (
                  <button
                    key={key}
                    onClick={() => toggleSchedule(key)}
                    className={`p-4 rounded-xl text-left transition-all duration-200 border ${
                      schedule[key]
                        ? "bg-brand-purple/15 border-brand-purple/40 text-text-primary"
                        : "bg-white/[0.03] border-white/10 text-text-secondary hover:border-white/20"
                    }`}
                  >
                    <div className="text-sm font-semibold">{label}</div>
                    <div className="text-xs text-text-muted mt-1">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-3">Dias</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "weekdays" as const, label: "📅 Dias úteis", desc: "Seg — Sex" },
                  { key: "weekends" as const, label: "🎉 Fins de semana", desc: "Sáb — Dom" },
                ].map(({ key, label, desc }) => (
                  <button
                    key={key}
                    onClick={() => toggleSchedule(key)}
                    className={`p-4 rounded-xl text-left transition-all duration-200 border ${
                      schedule[key]
                        ? "bg-brand-purple/15 border-brand-purple/40 text-text-primary"
                        : "bg-white/[0.03] border-white/10 text-text-secondary hover:border-white/20"
                    }`}
                  >
                    <div className="text-sm font-semibold">{label}</div>
                    <div className="text-xs text-text-muted mt-1">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-brand-pink/10 border border-brand-pink/20 text-brand-pink text-sm">{error}</div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(2)} className="btn-ghost py-3 px-6 text-sm">
                ← Voltar
              </button>
              <button
                onClick={handleRegister}
                disabled={loading}
                className="flex-1 btn-gradient py-3.5 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Criando conta...
                  </span>
                ) : (
                  "Criar minha conta 🚀"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
