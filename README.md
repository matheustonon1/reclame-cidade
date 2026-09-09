# Reclame Cidade

> Nome provisório. Plataforma web de reclamações urbanas por município, inspirada no modelo do Reclame Aqui, com moderação de conteúdo assistida por Inteligência Artificial.

Trabalho de Conclusão de Curso.

---

## Sobre o projeto

O sistema permite que cidadãos registrem reclamações sobre problemas urbanos do seu município — buracos na via, iluminação pública, coleta de lixo, saneamento, transporte — anexando texto e imagens. Órgãos públicos cadastrados podem responder oficialmente e atualizar o status de cada ocorrência, e os cidadãos avaliam se o problema foi de fato resolvido.

O diferencial técnico é o **pipeline de moderação automatizada**: todo conteúdo submetido passa por uma sequência de verificações antes de ser publicado, combinando checagens determinísticas com análise por modelo de linguagem multimodal.

### O que a moderação verifica

| Camada | Verificação |
|---|---|
| Pré-checagens | Limite de envios por usuário, tipo e tamanho do arquivo, hash perceptual da imagem (detecção de repostagem), metadados EXIF (data e geolocalização da foto) |
| Análise de texto | Conteúdo ofensivo ou discurso de ódio, spam, exposição de dados pessoais de terceiros, conteúdo fora do escopo municipal, indícios de desinformação |
| Análise de imagem | Conteúdo impróprio, presença de rostos ou placas legíveis, e coerência entre o que a imagem mostra e o que o texto descreve |
| Decisão | Publicação automática, encaminhamento para revisão humana ou rejeição com justificativa e direito a recurso |

Todas as decisões são registradas com o retorno do modelo, a versão do prompt utilizada e a latência, permitindo auditoria e análise posterior de precisão.

### Nota metodológica sobre desinformação

O sistema **não verifica fatos**. Nenhum modelo de linguagem consegue confirmar se existe de fato um buraco em determinada rua. O que o pipeline detecta são **indícios** de conteúdo não confiável — incoerência entre imagem e texto, metadados inconsistentes, imagem reciclada de outra ocorrência, linguagem sensacionalista, alegações amplas não verificáveis.

A validação factual é delegada a um mecanismo de **corroboração comunitária**: confirmações independentes de outros usuários verificados do mesmo município elevam o grau de confiabilidade da denúncia.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Front-end | React via Next.js (App Router), TypeScript |
| Estilização | Tailwind CSS (design system próprio, sem biblioteca de componentes) |
| Back-end | Next.js Route Handlers e Server Actions |
| Banco de dados | MySQL 8.4 |
| ORM | Prisma 6 |
| Autenticação | Auth.js (NextAuth), login por e-mail ou CPF |
| Moderação | API de LLM multimodal (Gemini) |
| Armazenamento de imagem | Vercel Blob |
| Processamento de imagem | sharp (redimensionamento/desfoque), blockhash-core (hash perceptual), exifr (metadados EXIF) |
| Antifake no cadastro | Cloudflare Turnstile (opcional) |
| Testes | Vitest |
| Infraestrutura local | Docker Compose |

As versões do Prisma estão fixadas propositalmente. A CLI passou por reestruturação em versões posteriores, com mudança de comandos e de formato de configuração. Fixar a versão garante reprodutibilidade do ambiente ao longo do desenvolvimento e na avaliação do trabalho.

---

## Pré-requisitos

- **Node.js** 20 ou superior — [nodejs.org](https://nodejs.org)
- **Docker Desktop** — [docker.com](https://www.docker.com/products/docker-desktop)
- **Git** — [git-scm.com](https://git-scm.com)

Não é necessário instalar MySQL na máquina. O banco roda em container.

Para verificar se está tudo disponível:

```bash
node --version
docker --version
git --version
```

---

## Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/SEU_USUARIO/reclame-cidade.git
cd reclame-cidade
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Configurar as variáveis de ambiente

Copie o arquivo de exemplo:

```bash
# Windows
copy .env.example .env

# Linux / macOS
cp .env.example .env
```

Abra o `.env` e preencha:

```env
DATABASE_URL="mysql://root:root@localhost:3306/reclame_cidade"
AUTH_SECRET="cole-aqui-uma-chave-gerada"
GEMINI_API_KEY="sua-chave-da-api"
BLOB_READ_WRITE_TOKEN="seu-token-do-vercel-blob"
```

Para gerar o `AUTH_SECRET`:

```bash
npx auth secret
```

O `BLOB_READ_WRITE_TOKEN` é necessário para o upload de imagem nas
reclamações. Crie um Blob store gratuito em
[vercel.com](https://vercel.com) → Storage → Create → Blob e copie o
token — funciona em desenvolvimento local, não é preciso publicar o
projeto na Vercel para testar. Sem essa variável, o restante do app
funciona normalmente; só o envio de fotos falha.

`NEXT_PUBLIC_APP_URL` é opcional (usada para montar o link no e-mail de
verificação de conta) — sem provedor de e-mail configurado, esse link
aparece no log do servidor em vez de ser enviado de verdade.

`NEXT_PUBLIC_TURNSTILE_SITE_KEY` e `TURNSTILE_SECRET_KEY` são opcionais
(proteção antifake no cadastro) — crie uma chave grátis em
[dash.cloudflare.com](https://dash.cloudflare.com) → Turnstile → Add
site. Sem essas variáveis, o cadastro funciona normalmente, só sem
verificação de bot.

O arquivo `.env` está no `.gitignore` e **nunca deve ser versionado**.

### 4. Subir o banco de dados

Com o Docker Desktop aberto:

```bash
docker compose up -d
```

A primeira execução baixa a imagem do MySQL (aproximadamente 500 MB). Verifique se o container subiu:

```bash
docker compose ps
```

O container `reclame_mysql` deve aparecer com status `Up`. Aguarde cerca de 20 segundos após a primeira subida — o MySQL leva um tempo para concluir a inicialização interna.

### 5. Aplicar as migrations

```bash
npx prisma migrate dev
```

Isso cria todas as tabelas do sistema no banco.

### 6. Popular os dados iniciais

```bash
npx prisma db seed
```

Carrega os municípios e as categorias de reclamação.

### 7. Iniciar a aplicação

```bash
npm run dev
```

Acesse **http://localhost:3000**

---

## Comandos de uso frequente

### Aplicação

```bash
npm run dev      # ambiente de desenvolvimento
npm run build    # build de produção
npm run start    # executa o build
npm run lint     # verificação de código
npm test         # roda os testes automatizados (Vitest)
```

### Banco de dados

```bash
docker compose up -d       # liga o banco
docker compose stop        # desliga preservando os dados
docker compose ps          # verifica o status
docker compose logs -f db  # acompanha os logs
```

### Prisma

```bash
npx prisma studio                    # interface visual do banco (localhost:5555)
npx prisma migrate dev --name nome   # cria e aplica uma migration
npx prisma generate                  # regenera o client após alterar o schema
```

### Recomeçar o banco do zero

Útil quando o banco local fica inconsistente. Apaga **todos** os dados:

```bash
docker compose down -v
docker compose up -d
npx prisma migrate dev
npx prisma db seed
```

---

## Estrutura de pastas

```
reclame-cidade/
├── prisma/
│   ├── schema.prisma        # modelo de dados
│   ├── migrations/          # histórico versionado do banco
│   └── seed.ts              # dados iniciais (geografia, categorias, admin/órgão demo)
├── src/
│   ├── app/
│   │   ├── (auth)/          # login, cadastro e verificação de e-mail
│   │   ├── (app)/           # área autenticada (painel, conta, reclamações, órgão)
│   │   ├── (admin)/         # moderação humana, histórico e fila de denúncias
│   │   ├── cidades/         # perfil público por cidade (ranking, índice de resolução)
│   │   ├── reclamacoes/     # feed público
│   │   ├── termos/          # Termos de Uso e Política de Privacidade
│   │   └── api/             # rotas de API (busca de cidade, consulta de CEP)
│   ├── components/          # UI compartilhada (header, menus, badges, combobox de cidade)
│   ├── lib/
│   │   ├── prisma.ts        # instância única do Prisma Client
│   │   ├── auth.ts          # configuração do Auth.js
│   │   ├── moderacao/       # pipeline de moderação por IA (texto + imagem)
│   │   ├── imagem.ts        # phash, EXIF e desfoque de rosto/placa
│   │   ├── storage.ts       # upload para o Vercel Blob
│   │   ├── cpf.ts           # validação e hash do CPF
│   │   ├── email.ts         # token e envio do e-mail de verificação
│   │   ├── notificacoes.ts  # criação de notificações in-app
│   │   ├── identificador.ts # busca de usuário por e-mail ou CPF
│   │   ├── verificacao.ts   # regra de e-mail obrigatório p/ confirmar e denunciar
│   │   └── turnstile.ts     # verificação antifake do Cloudflare Turnstile
│   └── types/
├── public/
├── docker-compose.yml
└── .env.example
```

---

## Fluxo de trabalho com Git

Commits diretos na `main` não são permitidos. Cada funcionalidade é desenvolvida em sua própria branch.

```bash
git checkout main
git pull

git checkout -b feat/nome-da-funcionalidade
# desenvolvimento
git add .
git commit -m "feat: descrição da alteração"
git push -u origin feat/nome-da-funcionalidade
```

Em seguida, abra um Pull Request no GitHub para revisão antes do merge.

### Convenção de mensagens

| Prefixo | Uso |
|---|---|
| `feat:` | nova funcionalidade |
| `fix:` | correção de bug |
| `refactor:` | reestruturação sem mudança de comportamento |
| `docs:` | documentação |
| `chore:` | configuração, dependências, infraestrutura |
| `test:` | testes |

### Sincronização do banco entre desenvolvedores

Cada desenvolvedor executa seu próprio container de MySQL local. A estrutura do banco é sincronizada pelas migrations, que são versionadas no repositório.

Ao alterar o `schema.prisma`, gere a migration e a inclua no commit:

```bash
npx prisma migrate dev --name descricao_da_alteracao
git add prisma/
```

Ao receber alterações de outro desenvolvedor:

```bash
git pull
npm install
npx prisma migrate dev
```

Arquivos de dump ou backup do banco **não** devem ser versionados.

---

## Problemas comuns

**`P1001: Can't reach database server`**
O container não está em execução. Rode `docker compose up -d` e aguarde alguns segundos. Verifique também se o Docker Desktop está aberto.

**`port 3306 is already allocated`**
Outro serviço MySQL ocupa a porta, geralmente XAMPP ou uma instalação local. Encerre esse serviço ou altere a porta no `docker-compose.yml` para `"3307:3306"`, ajustando a `DATABASE_URL` para `localhost:3307`.

**`docker: command not found`**
O Docker Desktop não está instalado ou o terminal foi aberto antes da instalação. Reinicie o terminal; se persistir, reinicie o computador.

**`Prisma config detected, skipping environment variable loading`**
Existe um arquivo `prisma.config.ts` na raiz do projeto, resíduo de uma versão mais recente do Prisma. Ele impede a leitura do `.env`. Remova o arquivo.

**Erro de tipo após alterar o `schema.prisma`**
O Prisma Client precisa ser regenerado: `npx prisma generate`.

---

## Ambiente de desenvolvimento recomendado

O repositório inclui `.vscode/extensions.json` com as extensões sugeridas. O VSCode oferece a instalação automaticamente ao abrir o projeto.

| Extensão | Função |
|---|---|
| Prisma | destaque de sintaxe e autocomplete no schema |
| ESLint | análise estática |
| Prettier | formatação automática |
| Tailwind CSS IntelliSense | autocomplete de classes |
| GitLens | histórico de alterações por linha |

---

## Considerações sobre privacidade

O sistema trata dados pessoais e observa a Lei Geral de Proteção de Dados (Lei nº 13.709/2018):

- Consentimento explícito aos Termos de Uso e à Política de Privacidade no cadastro (`/termos`)
- Coleta mínima de dados no cadastro
- Documentos de identificação, quando utilizados na verificação, são armazenados apenas em forma de hash
- Imagens submetidas passam por detecção de rostos e placas veiculares, com desfoque automático
- Edição de dados cadastrais e troca de senha disponíveis em "Minha conta"
- Exclusão de conta disponível ao usuário — anonimiza os dados pessoais; reclamações já publicadas são mantidas como registro de interesse público, sem identificação do autor
- Registros de moderação mantidos para fins de auditoria e recurso

### Integridade de conta e antifake

Como a plataforma lida com reclamações sobre a cidade — incluindo, indiretamente, sobre a gestão pública —, ela é um alvo natural de manipulação coordenada (contas falsas para inflar ou forjar corroboração comunitária). As medidas atuais são de integridade de conta/comportamento, não de moderação de conteúdo político:

- CPF único por conta (hash) e Cloudflare Turnstile no cadastro (opcional)
- Limite de contas criadas por IP e de reclamações/denúncias por usuário
- E-mail verificado obrigatório para confirmar ("também sofro com isso") e denunciar, com contas anteriores à regra isentas
- Rajada de confirmações fora do padrão gera alerta para moderador/admin — nunca ação automática; um problema real pode legitimamente viralizar, então a decisão final é sempre humana
- Denúncia de conteúdo publicado (`/denuncias`) e banimento de usuário (restrito a ADMIN) como consequência

---

## Licença

MIT.
