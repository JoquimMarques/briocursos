# 🔧 Aplicar Regras do Firestore via CLI

## Passo 1: Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

Ou se preferir usar npx (sem instalar globalmente):
```bash
npx firebase-tools --version
```

## Passo 2: Fazer Login no Firebase

```bash
firebase login
```

Isso abrirá o navegador para você fazer login com sua conta Google.

## Passo 3: Verificar Projeto

```bash
firebase projects:list
```

Deve mostrar o projeto `briolinkechat`.

## Passo 4: Aplicar as Regras

```bash
firebase deploy --only firestore:rules
```

Ou use o script npm:
```bash
npm run firebase:deploy-rules
```

## ✅ Pronto!

As regras serão aplicadas automaticamente. Aguarde a confirmação e recarregue o site!

## 🔍 Verificar se funcionou

Após aplicar, recarregue o site e verifique o console do navegador. Os erros de permissão devem desaparecer.

