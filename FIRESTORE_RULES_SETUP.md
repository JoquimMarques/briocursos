# Configuração das Regras de Segurança do Firestore

## Problema: Erro "Missing or insufficient permissions"

Se você está recebendo erros de permissão ao tentar buscar dados dos cursos e alunos, isso significa que as **regras de segurança do Firestore** não estão configuradas corretamente.

## Como Corrigir:

### 1. Acesse o Firebase Console
- Vá para: https://console.firebase.google.com/
- Selecione seu projeto: `briolinkechat`

### 2. Configure as Regras de Segurança do Firestore

1. No menu lateral, clique em **Firestore Database** (ou **Firestore**)
2. Clique na aba **Rules** (ou **Regras**)
3. Substitua as regras existentes por estas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Regras para a coleção de cursos
    match /courses/{courseId} {
      // Permitir leitura pública dos dados dos cursos
      allow read: if true;
      
      // Permitir escrita apenas para usuários autenticados (opcional, para admins)
      allow write: if request.auth != null;
      
      // Regras para subcoleção de inscrições (enrollments)
      match /enrollments/{enrollmentId} {
        // Permitir leitura pública para contar alunos
        allow read: if true;
        
        // Permitir escrita apenas para usuários autenticados
        // E apenas se o userId do documento corresponder ao usuário autenticado
        allow create: if request.auth != null 
                     && request.resource.data.userId == request.auth.uid;
        
        // Permitir atualização apenas pelo próprio usuário
        allow update: if request.auth != null 
                     && resource.data.userId == request.auth.uid
                     && request.resource.data.userId == request.auth.uid;
        
        // Permitir leitura pelo próprio usuário ou público
        allow read: if true || (request.auth != null && resource.data.userId == request.auth.uid);
      }
    }
    
    // Regras para a coleção de usuários
    match /users/{userId} {
      // Permitir leitura apenas pelo próprio usuário
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Permitir escrita apenas pelo próprio usuário
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Regras para a coleção de professores
    match /professores/{professorId} {
      // Permitir leitura pública
      allow read: if true;
      
      // Permitir escrita apenas para usuários autenticados
      allow write: if request.auth != null;
    }
    
    // Regra padrão: negar tudo que não foi explicitamente permitido
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 3. Publicar as Regras

1. Clique em **Publish** (ou **Publicar**)
2. Aguarde a confirmação de que as regras foram publicadas (pode levar alguns segundos)

### 4. Verificar

Após configurar as regras:
1. Recarregue a página do aplicativo
2. Os erros de permissão devem desaparecer
3. Verifique o console do navegador - não deve haver mais erros de "Missing or insufficient permissions"

## O que essas regras fazem:

- **Cursos (`courses`)**: Permite leitura pública de todos os dados dos cursos (títulos, descrições, etc.)
- **Inscrições (`enrollments`)**: Permite leitura pública para contar alunos, mas apenas o próprio usuário pode criar/atualizar sua inscrição
- **Usuários (`users`)**: Apenas o próprio usuário pode ler/escrever seus dados
- **Professores (`professores`)**: Leitura pública, escrita apenas para usuários autenticados

## Importante:

⚠️ **Essas regras permitem leitura pública dos dados de cursos e contagem de alunos.** Isso é necessário para que o site funcione corretamente, mas significa que qualquer pessoa pode ver quantos alunos estão inscritos em cada curso.

Se você quiser restringir mais as regras no futuro, pode modificar `allow read: if true;` para `allow read: if request.auth != null;` para exigir autenticação.

