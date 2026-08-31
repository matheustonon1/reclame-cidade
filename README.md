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
| Estilização | Tailwind CSS, shadcn/ui |
| Back-end | Next.js Route Handlers |
| Banco de dados | MySQL 8.4 |
| ORM | Prisma 6 |
| Autenticação | Auth.js (NextAuth) |
| Moderação | API de LLM multimodal |
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
OPENAI_API_KEY="sua-chave-da-api"
```

Para gerar o `AUTH_SECRET`:

```bash
npx auth secret
```

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
│   └── seed.ts              # dados iniciais
├── src/
│   ├── app/
│   │   ├── (auth)/          # login e cadastro
│   │   ├── (app)/           # área autenticada
│   │   ├── (admin)/         # painel de moderação
│   │   └── api/             # rotas de API
│   ├── components/
│   │   └── ui/              # componentes shadcn/ui
│   ├── lib/
│   │   ├── prisma.ts        # instância única do Prisma Client
│   │   ├── auth.ts          # configuração do Auth.js
│   │   └── moderacao/       # pipeline de moderação por IA
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

- Coleta mínima de dados no cadastro
- Documentos de identificação, quando utilizados na verificação, são armazenados apenas em forma de hash
- Imagens submetidas passam por detecção de rostos e placas veiculares, com desfoque automático
- Exclusão de conta e dos dados associados disponível ao usuário
- Registros de moderação mantidos para fins de auditoria e recurso

---

## Licença

MIT.
