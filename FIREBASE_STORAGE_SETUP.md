# Configuração do Firebase Storage

## Problema: Erro de CORS no Upload

Se você está recebendo erros de CORS ao tentar fazer upload de vídeos, isso geralmente significa que as **regras de segurança do Firebase Storage** não estão configuradas corretamente.

## Como Corrigir:

### 1. Acesse o Firebase Console
- Vá para: https://console.firebase.google.com/
- Selecione seu projeto: `briolinkechat`

### 2. Configure as Regras de Segurança do Storage

1. No menu lateral, clique em **Storage** (ou **Armazenamento**)
2. Clique na aba **Rules** (ou **Regras**)
3. Substitua as regras existentes por estas:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Regras para vídeos de cursos
    match /course-videos/{allPaths=**} {
      // Permitir leitura para usuários autenticados
      allow read: if request.auth != null;
      // Permitir escrita para usuários autenticados
      allow write: if request.auth != null;
    }
    
    // Regras padrão para outros arquivos (opcional)
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### 3. Publicar as Regras

1. Clique em **Publish** (ou **Publicar**)
2. Aguarde a confirmação de que as regras foram publicadas

### 4. Verificar Autenticação

Certifique-se de que:
- O usuário está logado no aplicativo
- A autenticação do Firebase está funcionando corretamente
- Você pode ver o usuário autenticado no console do navegador

## Teste

Após configurar as regras:
1. Recarregue a página do aplicativo
2. Tente fazer upload de um vídeo novamente
3. Verifique o console do navegador para logs de debug

## Regras Mais Restritivas (Recomendado para Produção)

Se você quiser regras mais restritivas, pode usar:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /course-videos/{courseId}/{fileName} {
      // Permitir leitura para usuários autenticados
      allow read: if request.auth != null;
      
      // Permitir escrita apenas para usuários autenticados
      // E opcionalmente, apenas para usuários específicos ou administradores
      allow write: if request.auth != null
                   && request.resource.size < 500 * 1024 * 1024  // Máximo 500MB
                   && request.resource.contentType.matches('video/.*');
    }
  }
}
```

## Solução de Problemas

### Erro: "storage/unauthorized"
- Verifique se as regras foram publicadas
- Verifique se o usuário está autenticado
- Verifique se o caminho do arquivo corresponde ao padrão nas regras

### Erro: "CORS policy"
- Certifique-se de que as regras permitem o método HTTP necessário
- Verifique se o bucket do Storage está configurado corretamente
- Tente limpar o cache do navegador

### Upload trava em 0%
- Verifique as regras de segurança
- Verifique se há erros no console do navegador
- Verifique a conexão com a internet
- Verifique o tamanho do arquivo (máximo 500MB)


