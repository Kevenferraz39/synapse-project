"use client";

const GROWTH_DATA = [
  { month: "Jan", users: 1200, matches: 800, rooms: 340 },
  { month: "Fev", users: 2800, matches: 1900, rooms: 680 },
  { month: "Mar", users: 5400, matches: 3800, rooms: 1200 },
  { month: "Abr", users: 8900, matches: 6200, rooms: 2100 },
  { month: "Mai", users: 12847, matches: 8934, rooms: 3400 },
];

const ENGAGEMENT = [
  { label: "DAU / MAU", value: "42%", desc: "Daily Active / Monthly Active", trend: "+3%" },
  { label: "Sessões/dia", value: "2.4", desc: "Média por usuário ativo", trend: "+0.3" },
  { label: "Tempo médio", value: "42min", desc: "Por sessão", trend: "+8min" },
  { label: "Pomodoros/dia", value: "3.2", desc: "Média por usuário", trend: "+0.5" },
  { label: "Taxa de match", value: "73%", desc: "Requests aceitos", trend: "+5%" },
  { label: "Churn mensal", value: "12%", desc: "Cancelamentos", trend: "-2%" },
];

const HOURLY_ACTIVITY = [
  { hour: "06h", value: 5 }, { hour: "07h", value: 8 }, { hour: "08h", value: 15 },
  { hour: "09h", value: 22 }, { hour: "10h", value: 30 }, { hour: "11h", value: 28 },
  { hour: "12h", value: 18 }, { hour: "13h", value: 25 }, { hour: "14h", value: 35 },
  { hour: "15h", value: 32 }, { hour: "16h", value: 28 }, { hour: "17h", value: 20 },
  { hour: "18h", value: 38 }, { hour: "19h", value: 55 }, { hour: "20h", value: 78 },
  { hour: "21h", value: 92 }, { hour: "22h", value: 100 }, { hour: "23h", value: 85 },
  { hour: "00h", value: 60 }, { hour: "01h", value: 30 },
];

export default function AdminAnalyticsPage() {
  const maxGrowth = Math.max(...GROWTH_DATA.map((d) => d.users));
  const maxHourly = Math.max(...HOURLY_ACTIVITY.map((d) => d.value));

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📈 Analytics</h1>
        <p className="text-text-secondary text-sm mt-1">Métricas detalhadas da plataforma</p>
      </div>

      {/* Engagement metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {ENGAGEMENT.map((metric, i) => (
          <div key={i} className="stat-card">
            <div className="text-xs text-text-muted mb-1">{metric.label}</div>
            <div className="text-2xl font-black font-mono">{metric.value}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-text-muted">{metric.desc}</span>
              <span className="text-[10px] font-medium text-brand-mint">↑ {metric.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Growth chart (CSS bar chart) */}
      <div className="glass-card p-6">
        <h2 className="font-semibold mb-6">Crescimento mensal</h2>
        <div className="flex items-end gap-4 h-48">
          {GROWTH_DATA.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[10px] font-mono text-brand-mint">{d.users.toLocaleString()}</span>
              <div className="w-full flex gap-1 items-end h-40">
                <div
                  className="flex-1 rounded-t-md bg-brand-purple/60 transition-all duration-500"
                  style={{ height: `${(d.users / maxGrowth) * 100}%` }}
                  title={`Usuários: ${d.users}`}
                />
                <div
                  className="flex-1 rounded-t-md bg-brand-pink/50 transition-all duration-500"
                  style={{ height: `${(d.matches / maxGrowth) * 100}%` }}
                  title={`Matches: ${d.matches}`}
                />
                <div
                  className="flex-1 rounded-t-md bg-brand-mint/40 transition-all duration-500"
                  style={{ height: `${(d.rooms / maxGrowth) * 100}%` }}
                  title={`Salas: ${d.rooms}`}
                />
              </div>
              <span className="text-xs text-text-muted">{d.month}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-6 mt-4 justify-center">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <div className="w-3 h-3 rounded bg-brand-purple/60" /> Usuários
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <div className="w-3 h-3 rounded bg-brand-pink/50" /> Matches
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <div className="w-3 h-3 rounded bg-brand-mint/40" /> Salas
          </div>
        </div>
      </div>

      {/* Hourly activity heatmap */}
      <div className="glass-card p-6">
        <h2 className="font-semibold mb-6">Atividade por horário (hoje)</h2>
        <div className="flex items-end gap-1.5 h-32">
          {HOURLY_ACTIVITY.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-sm transition-all duration-300 hover:opacity-80 cursor-pointer"
                style={{
                  height: `${(d.value / maxHourly) * 100}%`,
                  background: d.value > 70
                    ? "linear-gradient(to top, #FF6200, #F7145E)"
                    : d.value > 40
                    ? "linear-gradient(to top, #8C52FF, #F7145E)"
                    : "rgba(140, 82, 255, 0.3)",
                }}
                title={`${d.hour}: ${d.value}% atividade`}
              />
              <span className="text-[8px] text-text-muted">{d.hour}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-3 text-center">
          📌 Pico de atividade: <strong className="text-text-primary">22h</strong> — horário ideal para notificações
        </p>
      </div>

      {/* Funnel */}
      <div className="glass-card p-6">
        <h2 className="font-semibold mb-6">Funil de conversão</h2>
        <div className="space-y-3 max-w-2xl mx-auto">
          {[
            { step: "Visitou landing page", value: 45000, pct: 100 },
            { step: "Clicou em cadastrar", value: 18000, pct: 40 },
            { step: "Completou cadastro", value: 12847, pct: 28.5 },
            { step: "Preencheu perfil", value: 9800, pct: 21.8 },
            { step: "Fez primeiro match", value: 7200, pct: 16 },
            { step: "Completou 1º Pomodoro", value: 5400, pct: 12 },
            { step: "Retornou na semana 2", value: 3600, pct: 8 },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-xs text-text-muted w-44 shrink-0">{f.step}</span>
              <div className="flex-1 h-6 rounded-lg bg-white/[0.04] overflow-hidden relative">
                <div
                  className="h-full rounded-lg bg-gradient-main transition-all duration-700"
                  style={{ width: `${f.pct}%` }}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold">
                  {f.value.toLocaleString()}
                </span>
              </div>
              <span className="text-xs font-mono text-text-muted w-12 text-right">{f.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
