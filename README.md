# BrioCursos 📚

Uma plataforma moderna de cursos online criada com React e Vite. Oferece cursos gratuitos e completos em diversas áreas: Programação, Economia, Cibersegurança, Marketing Digital e Matemática.

## 🚀 Como começar

### Instalar dependências

```bash
npm install
```

### Configurar o Firebase

1. Configure o Firebase no arquivo `src/services/firebase.js` com suas credenciais
2. Configure as regras de segurança do Firestore e Storage no Firebase Console

### Executar o servidor de desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

### Criar build de produção

```bash
npm run build
```

### Preview da build de produção

```bash
npm run preview
```

## 📦 Tecnologias

- **React 18** - Biblioteca JavaScript para interfaces de usuário
- **React Router** - Navegação entre páginas
- **Axios** - Cliente HTTP para requisições à API
- **Vite** - Build tool moderna e rápida
- **ESLint** - Ferramenta de linting para manter o código limpo

## 📚 Funcionalidades de Cursos

### Adicionar Vídeos aos Cursos

A plataforma suporta três formas de adicionar vídeos:

1. **YouTube** - Cole a URL do vídeo do YouTube
2. **URL Direta** - Use URLs de serviços como Vimeo, Google Drive, etc.
3. **Upload (Firebase Storage)** - Faça upload direto (requer configuração do Firebase Storage)

📖 **Veja o guia completo:** [COMO_ADICIONAR_VIDEOS.md](./COMO_ADICIONAR_VIDEOS.md)

### Gerenciar Cursos

- Acesse `/curso/:id/gerenciar` para gerenciar vídeos de um curso
- Adicione, edite e remova vídeos
- Configure duração e ordem dos vídeos

## 🎯 Funcionalidades

- 🏠 **Página Inicial** - Hero section e cursos em destaque
- 📚 **Jornadas de Aprendizado** - Explore cursos organizados por jornadas
- 🎓 **Cursos Completos** - Cursos com vídeos, progresso e certificação
- 📺 **Player de Vídeos** - Suporte para YouTube, Vimeo e vídeos diretos
- 👤 **Sistema de Usuários** - Perfil, progresso e inscrições
- ⭐ **Avaliações** - Sistema de avaliação de cursos
- 📱 **Design Responsivo** - Funciona perfeitamente em mobile e desktop
- 🎨 **Interface Moderna** - Tema escuro com gradientes vibrantes

## 📁 Estrutura do projeto

```
BrioCursos/
├── public/              # Arquivos estáticos
├── src/
│   ├── components/      # Componentes reutilizáveis
│   │   ├── Navbar.jsx   # Barra de navegação
│   │   └── CourseCard.jsx # Card de curso
│   ├── pages/           # Páginas da aplicação
│   │   ├── Home.jsx     # Página inicial
│   │   ├── CoursePlayer.jsx # Player de cursos/vídeos
│   │   ├── ManageCourse.jsx # Gerenciar vídeos do curso
│   │   ├── JourneyView.jsx # Visualizar jornada
│   │   ├── Login.jsx    # Login
│   │   ├── Perfil.jsx   # Perfil do usuário
│   │   └── Sobre.jsx    # Sobre a plataforma
│   ├── services/        # Serviços e APIs
│   │   ├── firebase.js  # Configuração do Firebase
│   │   ├── coursesData.js # Dados dos cursos
│   │   └── coursesApi.js # API de cursos
│   ├── App.jsx          # Componente principal
│   └── main.jsx         # Ponto de entrada
├── .env.example         # Exemplo de configuração
├── index.html
├── vite.config.js
└── package.json
```

## 🛠️ Scripts disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm run preview` - Preview da build de produção
- `npm run lint` - Executa o ESLint

## 📝 Como Personalizar

1. **Configure o Firebase** com suas credenciais em `src/services/firebase.js`
2. **Adicione cursos** editando `src/services/coursesData.js`
3. **Configure as regras de segurança** do Firestore e Storage no Firebase Console
4. **Personalize os cursos** adicionando vídeos através da interface de gerenciamento

## 🔧 Tipos de Vídeos Suportados

- **YouTube** - URLs do YouTube (convertidas automaticamente para embed)
- **Vimeo** - URLs do Vimeo (convertidas automaticamente para embed)
- **URL Direta** - URLs diretas de vídeos (MP4, WebM, OGG) ou outros serviços
- **Firebase Storage** - Upload direto para Firebase Storage (requer configuração)

## 📝 Notas

- A plataforma usa Firebase Firestore para armazenar dados dos cursos
- Os vídeos são armazenados como URLs (links), não como arquivos
- YouTube e Vimeo são convertidos automaticamente para formato embed
- O sistema de progresso rastreia quais vídeos o usuário já assistiu
