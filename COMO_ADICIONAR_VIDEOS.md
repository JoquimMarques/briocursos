# Como Adicionar Vídeos ao Curso

Agora você tem **3 opções** para adicionar vídeos aos seus cursos, sem precisar pagar pelo Firebase Storage!

## 📺 Opção 1: YouTube (Recomendado - Gratuito)

1. Selecione **"YouTube"**
2. Cole a URL completa do vídeo do YouTube
   - Exemplo: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
3. Informe a duração em minutos
4. Clique em **"Adicionar Vídeo"**

**Vantagens:**
- ✅ Totalmente gratuito
- ✅ Sem limites de armazenamento
- ✅ Qualidade automática
- ✅ Não consome seu próprio servidor

---

## 🔗 Opção 2: URL Direta (Gratuito - Nova!)

Esta é a melhor opção se você não quer usar o Firebase Storage!

1. Selecione **"URL Direta"**
2. Cole a URL do vídeo hospedado em outro serviço
3. Informe a duração em minutos
4. Clique em **"Adicionar Vídeo"**

### Onde hospedar vídeos gratuitamente:

#### **Vimeo** (Recomendado)
- Site: https://vimeo.com
- Faça upload do vídeo
- Copie a URL de compartilhamento
- Cole no campo "URL Direta"

#### **Google Drive**
- Faça upload do vídeo
- Clique com botão direito → "Obter link"
- Configure para "Qualquer pessoa com o link pode ver"
- Use a URL direta do arquivo (formato: `https://drive.google.com/file/d/ID_DO_ARQUIVO/view`)
- **Nota:** Pode precisar de ajustes para funcionar diretamente

#### **Servidor Próprio**
- Se você tem seu próprio servidor, faça upload do vídeo
- Cole a URL direta (ex: `https://seuservidor.com/videos/meu-video.mp4`)

#### **Outros Serviços Gratuitos:**
- **Cloudinary** (com plano gratuito)
- **Imgur** (para vídeos curtos)
- **Streamable** (especializado em vídeos)

**Vantagens:**
- ✅ Gratuito (dependendo do serviço escolhido)
- ✅ Não precisa do Firebase Storage
- ✅ Controle sobre onde o vídeo está hospedado

---

## 📤 Opção 3: Upload para Firebase Storage (Requer pagamento)

1. Selecione **"Upload (Firebase)"**
2. Escolha o arquivo de vídeo do seu computador
3. Aguarde o upload (pode demorar para vídeos grandes)
4. Informe a duração em minutos
5. Clique em **"Adicionar Vídeo"**

**Desvantagens:**
- ❌ Requer plano pago do Firebase Storage
- ❌ Limites de armazenamento
- ❌ Pode ter custos adicionais

---

## 🎯 Recomendação

Para a maioria dos casos, recomendamos usar:
1. **YouTube** - se o conteúdo pode ser público
2. **URL Direta (Vimeo)** - se você quer mais controle ou privacidade

Ambas as opções são **100% gratuitas** e não requerem pagamento do Firebase Storage!

---

## 📝 Dicas

- **Qualidade do vídeo:** Use formatos MP4, WebM ou OGG para melhor compatibilidade
- **Tamanho:** Mesmo usando URLs diretas, evite vídeos muito grandes (>500MB)
- **Duração:** Sempre informe a duração correta para que o progresso do curso seja calculado corretamente
- **Teste:** Após adicionar, teste o vídeo para garantir que está funcionando corretamente

---

## ❓ Problemas Comuns

### Vídeo não carrega
- Verifique se a URL está correta e acessível
- Certifique-se de que o vídeo está configurado para acesso público (se necessário)
- Teste a URL diretamente no navegador

### Erro de CORS
- Isso geralmente acontece com uploads para Firebase Storage
- Use a opção "URL Direta" em vez de "Upload (Firebase)"

### Vídeo lento para carregar
- Considere usar um serviço de CDN (como Vimeo ou YouTube)
- Comprima o vídeo antes de fazer upload
- Use formatos otimizados (MP4 com H.264)

