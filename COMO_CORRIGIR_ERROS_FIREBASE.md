# 🔧 Como Corrigir os Erros do Firebase

## ⚠️ IMPORTANTE: Você PRECISA aplicar as regras no Firebase Console!

Os erros "Missing or insufficient permissions" aparecem porque as regras de segurança do Firestore não estão configuradas. **Siga estes passos EXATOS:**

## 📋 Passo a Passo (5 minutos)

### 1. Acesse o Firebase Console
- Abra: https://console.firebase.google.com/
- Faça login com sua conta Google
- Selecione o projeto: **briolinkechat**

### 2. Vá para Firestore Database
- No menu lateral esquerdo, clique em **"Firestore Database"** (ou "Firestore")
- Se não aparecer, clique em **"Build"** no menu e depois em **"Firestore Database"**

### 3. Abra a aba Rules
- No topo da página, clique na aba **"Rules"** (ou "Regras")

### 4. Cole estas regras EXATAS:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Regras para a coleção de cursos
    match /courses/{courseId} {
      // Permitir leitura pública dos dados dos cursos
      allow read: if true;
      
      // Permitir escrita apenas para usuários autenticados
      allow write: if request.auth != null;
      
      // Regras para subcoleção de inscrições (enrollments)
      match /enrollments/{enrollmentId} {
        // Permitir leitura pública para contar alunos
        allow read: if true;
        
        // Permitir escrita apenas para usuários autenticados
        allow create: if request.auth != null 
                     && request.resource.data.userId == request.auth.uid;
        
        // Permitir atualização apenas pelo próprio usuário
        allow update: if request.auth != null 
                     && resource.data.userId == request.auth.uid
                     && request.resource.data.userId == request.auth.uid;
      }
      
      // Regras para subcoleção de avaliações (ratings)
      match /ratings/{ratingId} {
        // Permitir leitura pública para calcular média de avaliações
        allow read: if true;
        
        // Permitir escrita apenas para usuários autenticados
        allow create: if request.auth != null 
                     && request.resource.data.userId == request.auth.uid;
        
        // Permitir atualização apenas pelo próprio usuário
        allow update: if request.auth != null 
                     && resource.data.userId == request.auth.uid
                     && request.resource.data.userId == request.auth.uid;
      }
    }
    
    // Regras para a coleção de usuários
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Regras para a coleção de professores
    match /professores/{professorId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 5. Publique as Regras
- Clique no botão **"Publish"** (ou "Publicar") no topo direito
- Aguarde a mensagem de confirmação (pode levar 10-30 segundos)

### 6. Recarregue o Site
- Volte para o seu site
- Pressione **Ctrl+Shift+R** (Windows/Linux) ou **Cmd+Shift+R** (Mac) para recarregar completamente
- Os erros devem desaparecer!

## ✅ Verificação

Após aplicar as regras, você deve ver:
- ✅ Nenhum erro "Missing or insufficient permissions" no console
- ✅ Os números de alunos aparecendo nos cursos
- ✅ O site funcionando normalmente

## 🐛 Sobre os Outros Erros

Os erros de `checkPageManual.js`, `overlays.js` e `content.js` são de **extensões do navegador** (como React DevTools, Redux DevTools, etc.). Eles não afetam o funcionamento do site e podem ser ignorados.

Se quiser removê-los:
- Desative extensões do desenvolvedor temporariamente
- Ou use uma janela anônima/privada

## 📞 Precisa de Ajuda?

Se os erros continuarem após aplicar as regras:
1. Verifique se clicou em "Publish"
2. Aguarde 1-2 minutos e recarregue a página
3. Verifique se está no projeto correto (`briolinkechat`)
4. Limpe o cache do navegador (Ctrl+Shift+Delete)

