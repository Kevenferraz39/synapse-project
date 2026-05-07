# 🧠 Synapse — Guia de Setup no Firebase Studio

## Passo 1: Criar o Workspace

1. Acesse [Firebase Studio](https://studio.firebase.google.com/)
2. Clique em **"Import a repo"** ou **"Create new workspace"**
3. Escolha o template **Next.js** (ou faça upload dos arquivos)
4. Extraia o `synapse-project.tar.gz` e suba todos os arquivos

> **Dica:** O arquivo `.idx/dev.nix` já configura tudo automaticamente:
> Node.js 20, extensões do VS Code, e o preview do app.

---

## Passo 2: Criar o Projeto no Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em **"Adicionar projeto"** → Nomeie como `synapse`
3. Ative os serviços:
   - **Authentication** → Métodos: Email/Senha + Google
   - **Cloud Firestore** → Criar banco (modo teste inicialmente)
   - **Storage** → Criar bucket

---

## Passo 3: Configurar Variáveis de Ambiente

No Firebase Console, vá em **Configurações do projeto** → **Apps** → **Adicionar app web**.

Copie as credenciais e crie o arquivo `.env.local` no terminal do Studio:

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_FIREBASE_API_KEY=cole_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=cole_aqui
NEXT_PUBLIC_FIREBASE_APP_ID=cole_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Synapse
EOF
```

---

## Passo 4: Autorizar o Domínio do Preview

Para o login com Google funcionar no preview do Studio:

1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Adicione o domínio do preview (aparece na barra do Studio, algo como `*.idx.dev` ou `*.web.app`)

---

## Passo 5: Instalar e Rodar

No terminal do Firebase Studio:

```bash
npm install
npm run dev
```

O preview vai abrir automaticamente dentro do Studio! 🎉

---

## Passo 6: Deploy das Regras do Firestore

```bash
# Instalar Firebase CLI (se não tiver)
npm install -g firebase-tools

# Login
firebase login

# Conectar ao projeto
firebase use --add  # selecione seu projeto

# Deploy das regras e índices
firebase deploy --only firestore:rules,firestore:indexes,storage
```

---

## Passo 7: Criar seu Usuário Admin

Após criar sua conta normalmente pelo app:

1. Vá no **Firebase Console** → **Firestore**
2. Encontre seu documento em `users/{seu-uid}`
3. Edite o campo `role` de `"student"` para `"admin"`
4. Recarregue o app — o menu Admin vai aparecer na sidebar!

---

## Estrutura do Projeto

```
synapse/
├── .idx/dev.nix              ← Config do Firebase Studio
├── firebase.json             ← Config do Firebase (hosting, firestore, storage)
├── firestore.rules           ← Regras de segurança do Firestore
├── firestore.indexes.json    ← Índices compostos
├── storage.rules             ← Regras do Storage
├── landing-page.html         ← Landing page estática
├── src/
│   ├── app/
│   │   ├── layout.tsx        ← Root layout
│   │   ├── globals.css       ← Estilos globais + Tailwind
│   │   ├── auth/             ← Login, Registro, Esqueci Senha
│   │   ├── dashboard/        ← Home, Matches, Salas, Chat, Rankings, Perfil
│   │   └── admin/            ← Dashboard, Usuários, Analytics, Denúncias
│   ├── lib/
│   │   ├── firebase.ts       ← Firebase init
│   │   ├── auth-service.ts   ← Autenticação
│   │   ├── match-service.ts  ← Algoritmo de match (5 fatores)
│   │   ├── gamification-service.ts ← XP, badges, leaderboard
│   │   ├── admin-service.ts  ← Gestão admin
│   │   └── utils.ts          ← Helpers
│   ├── contexts/
│   │   └── AuthContext.tsx    ← Provider de autenticação
│   └── types/
│       └── index.ts          ← Todos os tipos TypeScript
├── tailwind.config.ts        ← Design tokens (cores Synapse)
└── package.json
```

---

## Cores da Marca

| Cor       | Hex       | Uso                         |
|-----------|-----------|-----------------------------|
| Orange    | `#FF6200` | CTAs, destaques quentes     |
| Pink      | `#F7145E` | Alertas, badges, live       |
| Purple    | `#8C52FF` | Primária, links, seleção    |
| Mint      | `#85F9B4` | Sucesso, XP, compatibilidade|

---

## Próximos Passos

- [ ] Conectar Firebase real (substituir mock data)
- [ ] Implementar WebRTC ou Daily.co para vídeo nas salas
- [ ] Chat real-time com Firestore listeners
- [ ] Notificações push com Firebase Cloud Messaging
- [ ] Deploy para produção via Firebase Hosting
- [ ] Landing page como rota `/` do Next.js

---

Feito com 🧠 por Synapse Team
