# Guia para Adicionar Jogos do GameDistribution

Este guia explica como adicionar jogos do GameDistribution ao seu site.

## Como encontrar jogos no GameDistribution

1. Acesse [https://gamedistribution.com/games](https://gamedistribution.com/games)
2. Navegue pelos jogos disponíveis
3. Clique em um jogo para ver os detalhes

## Como obter o Hash e ID do jogo

Quando você encontrar um jogo, você precisa de duas informações:

1. **ID do jogo**: O slug na URL (ex: `archery-ragdoll`)
2. **Hash do jogo**: O hash presente no iframe do jogo

### Exemplo:

Se você vê um iframe assim:
```html
<iframe 
  src="https://html5.gamedistribution.com/1ebba0a58564412f9a6be21511f86b48/?gd_sdk_referrer_url=https://gamedistribution.com/games/archery-ragdoll/" 
  ...
></iframe>
```

- **Hash**: `1ebba0a58564412f9a6be21511f86b48`
- **ID**: `archery-ragdoll`

## Como adicionar um novo jogo

Abra o arquivo `src/services/gameDistribution.js` e adicione um novo objeto no array `gameDistributionGames`:

```javascript
{
  id: 'nome-do-jogo',              // ID do jogo (slug da URL)
  title: 'Nome do Jogo',           // Título do jogo
  description: 'Descrição do jogo', // Descrição curta
  category: 'Ação',                 // Categoria: 'Ação', 'Puzzle', 'Arcade', etc.
  difficulty: 'Médio',              // 'Fácil', 'Médio', 'Difícil'
  playTime: '5-10 min',             // Tempo estimado de jogo
  thumbnail: 'URL_DA_IMAGEM',       // URL da thumbnail (opcional)
  color: '#FF6B6B',                 // Cor de destaque em hex
  gameHash: 'hash_do_jogo',         // Hash do jogo do iframe
  instructions: 'Instruções de como jogar',
}
```

### Exemplo completo:

```javascript
{
  id: 'archery-ragdoll',
  title: 'Archery Ragdoll',
  description: 'Dispute uma competição de tiro com arco contra os melhores arqueiros do mundo!',
  category: 'Ação',
  difficulty: 'Médio',
  playTime: '5-10 min',
  thumbnail: 'https://html5.gamedistribution.com/1ebba0a58564412f9a6be21511f86b48/thumbnail.jpg',
  color: '#FF6B6B',
  gameHash: '1ebba0a58564412f9a6be21511f86b48',
  instructions: 'Use o mouse para mirar e atirar. Teste sua pontaria!',
}
```

## Categorias disponíveis

Use uma das seguintes categorias:
- `Ação`
- `Puzzle`
- `Arcade`
- `Estratégia`
- `Corrida`
- `Esportes`
- `Aventura`
- `Clássico`

## Dificuldades disponíveis

- `Fácil`
- `Médio`
- `Difícil`

## Notas importantes

- O `gameHash` e `id` são **obrigatórios** para que o jogo funcione
- O `gameHash` pode ser encontrado no código HTML do iframe do jogo
- Você pode deixar `thumbnail` como emoji (ex: `🎮`) se não tiver a URL da imagem
- A URL do jogo será gerada automaticamente usando a função `buildGameDistributionUrl()`

## Adicionar múltiplos jogos

Você pode adicionar quantos jogos quiser ao array. O site irá exibir todos automaticamente nas páginas correspondentes (Home, Populares, Categorias, etc.).

