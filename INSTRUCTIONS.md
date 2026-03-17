# XEROX MVP — Especificação Completa do Projeto
# Arquivo de contexto para uso com Claude Code ou qualquer LLM

---

## VISÃO GERAL

Sistema de gestão de vale-caixa digital para gráfica/xerox.
Substitui o papel físico (vale-caixa impresso) e a planilha manual do filho do dono.
Cada funcionário registra digitalmente os serviços que prestou durante o dia.
O admin acompanha em tempo real e gera relatório mensal que compõe o salário.

---

## STACK TÉCNICA

- **Framework:** Next.js 15 (App Router, Server Components, Server Actions)
- **Linguagem:** TypeScript (strict mode)
- **Banco:** PostgreSQL via Neon (serverless, free tier)
- **ORM:** Prisma 5
- **Auth:** JWT em cookie httpOnly + tabela Session no banco (permite invalidação)
- **UI:** shadcn/ui + Tailwind CSS v4
- **Formulários:** react-hook-form + zod
- **Tabelas/relatório:** tanstack/react-table
- **Export:** xlsx (para Excel) + @react-pdf/renderer (para PDF)
- **Hash de senha:** bcryptjs

---

## REGRAS DE NEGÓCIO

1. Existe um único login (`/login`) que redireciona por role:
   - `ADMIN` → `/admin`
   - `EMPLOYEE` → `/dashboard`

2. O admin é o único que pode:
   - Criar/editar/desativar funcionários (username + senha + código único)
   - Criar/editar/desativar produtos (código + nome + preço + quantidade em estoque)
   - Ver relatório de todos os funcionários
   - Exportar relatório em Excel e PDF

3. O funcionário pode:
   - Registrar lançamentos: digita código do produto → sistema puxa nome + preço automaticamente → funcionário informa quantidade → pode editar o preço unitário se necessário → confirma
   - Ao confirmar, o estoque do produto é reduzido automaticamente (qty - quantidade lançada)
   - Ver seus próprios lançamentos do dia e do mês
   - Editar ou excluir lançamentos do mesmo dia (não pode editar de dias anteriores)
   - Cadastrar novos produtos no estoque (admin também pode, ambos têm acesso ao CRUD de produtos)

4. Produto e serviço são a mesma entidade (`Product`). Cada produto tem:
   - Código único (ex: "001", "IMP-PB")
   - Nome (ex: "Impressão P&B", "Plastificação A4")
   - Preço unitário base
   - Quantidade em estoque atual
   - Status ativo/inativo

5. Cada lançamento (`Entry`) registra:
   - Qual funcionário
   - Qual produto (e salva o nome + preço no momento do lançamento, para histórico imutável)
   - Quantidade
   - Preço unitário aplicado (pode diferir do preço base se editado)
   - Total calculado (qty * preço unitário)
   - Data/hora
   - Se foi editado e quando

6. Relatório mensal mostra:
   - Tabela-dashboard: uma linha por funcionário com total de lançamentos e total em R$ no período
   - Ao clicar no funcionário: detalhamento de cada lançamento
   - Filtro por período (mês/ano ou intervalo de datas)
   - Exportar tudo em Excel (.xlsx) ou PDF

7. Estoque:
   - Ao lançar um Entry, o `stock` do produto diminui pela quantidade lançada
   - Se estoque < 0 após o lançamento, retorna erro (não permite lançamento sem estoque)
   - Admin pode ajustar o estoque manualmente a qualquer momento
   - Relatório de consumo de estoque por período (quanto de cada produto foi consumido)

---

## ESTRUTURA DE PASTAS

```
xerox-mvp/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                        ← seed com admin padrão + produtos exemplo
├── src/
│   ├── app/
│   │   ├── layout.tsx                 ← root layout, fonte, providers
│   │   ├── page.tsx                   ← redireciona para /login ou /dashboard
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx           ← tela de login única
│   │   ├── (employee)/
│   │   │   └── dashboard/
│   │   │       ├── page.tsx           ← dashboard do funcionário
│   │   │       └── _components/
│   │   │           ├── EntryForm.tsx  ← formulário de lançamento
│   │   │           └── EntryList.tsx  ← lista dos lançamentos do dia
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       ├── layout.tsx         ← sidebar do admin
│   │   │       ├── page.tsx           ← dashboard geral (tabela de funcionários)
│   │   │       ├── employees/
│   │   │       │   ├── page.tsx       ← lista de funcionários
│   │   │       │   └── _components/
│   │   │       │       ├── EmployeeTable.tsx
│   │   │       │       └── EmployeeForm.tsx
│   │   │       ├── products/
│   │   │       │   ├── page.tsx       ← lista de produtos/estoque
│   │   │       │   └── _components/
│   │   │       │       ├── ProductTable.tsx
│   │   │       │       └── ProductForm.tsx
│   │   │       └── reports/
│   │   │           ├── page.tsx       ← relatório mensal
│   │   │           └── _components/
│   │   │               ├── ReportTable.tsx
│   │   │               ├── EmployeeDetail.tsx
│   │   │               └── ExportButtons.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   └── logout/route.ts
│   │       ├── products/
│   │       │   ├── route.ts           ← GET (lista) + POST (criar)
│   │       │   └── [id]/route.ts      ← GET + PUT + DELETE
│   │       ├── entries/
│   │       │   ├── route.ts           ← GET (lista do usuário) + POST (criar)
│   │       │   └── [id]/route.ts      ← PUT + DELETE (somente no mesmo dia)
│   │       ├── employees/
│   │       │   ├── route.ts           ← GET + POST (admin only)
│   │       │   └── [id]/route.ts      ← GET + PUT + DELETE (admin only)
│   │       └── report/
│   │           └── route.ts           ← GET com filtros (admin only)
│   ├── lib/
│   │   ├── prisma.ts                  ← singleton do PrismaClient
│   │   ├── auth.ts                    ← funções JWT: sign, verify, getSession
│   │   ├── actions/
│   │   │   ├── auth.actions.ts        ← Server Actions de login/logout
│   │   │   ├── entry.actions.ts       ← Server Actions de lançamento
│   │   │   ├── product.actions.ts     ← Server Actions de produto/estoque
│   │   │   └── employee.actions.ts    ← Server Actions de funcionário
│   │   └── validations/
│   │       ├── auth.schema.ts
│   │       ├── entry.schema.ts
│   │       ├── product.schema.ts
│   │       └── employee.schema.ts
│   ├── components/
│   │   └── ui/                        ← shadcn/ui components (gerados via CLI)
│   ├── hooks/
│   │   └── useProductLookup.ts        ← hook: digita código → debounce → fetch produto
│   ├── types/
│   │   └── index.ts                   ← tipos globais derivados do Prisma
│   └── middleware.ts                  ← Next.js edge middleware: proteção de rotas por role
├── .env.local                         ← DATABASE_URL, JWT_SECRET
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## PRISMA SCHEMA COMPLETO

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ───────────────────────────────────────────────────────────────────

enum Role {
  ADMIN
  EMPLOYEE
}

// ─── MODELS ──────────────────────────────────────────────────────────────────

model User {
  id        String    @id @default(cuid())
  /// Código único de identificação do funcionário (ex: "001", "FUN-023")
  code      String    @unique
  /// Username para login
  username  String    @unique
  name      String
  password  String    // bcrypt hash
  role      Role      @default(EMPLOYEE)
  active    Boolean   @default(true)

  entries   Entry[]
  sessions  Session[]

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([username])
  @@index([code])
}

model Session {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([token])
  @@index([userId])
}

model Product {
  /// Produto = Serviço. A mesma entidade serve para ambos os conceitos.
  id        String   @id @default(cuid())
  /// Código único do produto (ex: "001", "IMP-PB", "PLAST-A4")
  code      String   @unique
  name      String
  /// Preço unitário base. Pode ser sobrescrito no lançamento.
  price     Decimal  @db.Decimal(10, 2)
  /// Quantidade atual em estoque. Nunca pode ser negativo.
  stock     Int      @default(0)
  active    Boolean  @default(true)

  entries   Entry[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([code])
}

model Entry {
  id        String   @id @default(cuid())

  userId    String
  user      User     @relation(fields: [userId], references: [id])

  productId String
  product   Product  @relation(fields: [productId], references: [id])

  /// Nome do produto no momento do lançamento (imutável para histórico)
  productName  String
  /// Preço unitário aplicado no lançamento (pode diferir do base)
  unitPrice    Decimal  @db.Decimal(10, 2)
  /// Quantidade lançada
  qty          Int
  /// Total = qty * unitPrice (calculado e salvo na API)
  total        Decimal  @db.Decimal(10, 2)

  /// Nota opcional do funcionário
  note         String?

  /// Flag se o preço foi editado manualmente
  priceEdited  Boolean  @default(false)

  /// Data do lançamento (sem hora, para filtros de "hoje" e mensais)
  date         DateTime @default(now())

  /// Auditoria de edição
  editedAt     DateTime?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([userId])
  @@index([productId])
  @@index([date])
  @@index([userId, date])
}
```

---

## VARIÁVEIS DE AMBIENTE (.env.local)

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-XXXX.neon.tech/xerox?sslmode=require&pgbouncer=true&connect_timeout=15"
JWT_SECRET="gere-uma-string-de-32-chars-aqui-use-openssl-rand-base64-32"
NEXT_PUBLIC_APP_NAME="Xerox Manager"
```

---

## AUTH: COMO FUNCIONA

### Fluxo de login

1. Usuário envia `username` + `password` para Server Action `loginAction`
2. Server Action:
   a. Busca `User` por `username` no banco
   b. Compara senha com `bcrypt.compare`
   c. Gera JWT com payload `{ sub: user.id, role: user.role, code: user.code }`
   d. Salva registro na tabela `Session` (token + expiresAt = 7 dias)
   e. Seta cookie `session` httpOnly, secure, sameSite=lax, maxAge=7d
3. Next.js middleware lê o cookie e redireciona por role

### Middleware (src/middleware.ts)

```typescript
// Rotas protegidas e redirecionamentos por role
// /login          → público (redireciona se já autenticado)
// /dashboard/*    → EMPLOYEE ou ADMIN
// /admin/*        → somente ADMIN (redireciona EMPLOYEE para /dashboard)
// /api/employees  → somente ADMIN
// /api/report     → somente ADMIN
```

### Invalidação de sessão

- Logout: deleta o registro `Session` do banco + limpa o cookie
- Sessões expiradas são ignoradas no middleware (não é necessário job de limpeza no MVP)

---

## API ROUTES — CONTRATOS

### POST /api/auth/login
```json
// Request
{ "username": "joao.silva", "password": "senha123" }

// Response 200
{ "user": { "id": "...", "name": "João", "role": "EMPLOYEE", "code": "001" } }
// + Set-Cookie: session=<jwt>; HttpOnly; ...

// Response 401
{ "error": "Credenciais inválidas" }
```

### POST /api/entries
```json
// Request (EMPLOYEE autenticado)
{
  "productCode": "IMP-PB",
  "qty": 10,
  "unitPrice": 0.50,   // opcional — se omitido usa o preço base do produto
  "note": "cliente urgente"
}

// Response 201
{
  "entry": {
    "id": "...",
    "productName": "Impressão P&B",
    "unitPrice": "0.50",
    "qty": 10,
    "total": "5.00",
    "date": "2025-03-17T..."
  }
}

// Response 400 — estoque insuficiente
{ "error": "Estoque insuficiente. Disponível: 3 unidades." }

// Response 404 — produto não encontrado
{ "error": "Produto não encontrado com o código IMP-PB" }
```

### GET /api/products?code=IMP-PB
```json
// Response 200 — usado pelo hook de lookup ao digitar o código
{
  "product": {
    "id": "...",
    "code": "IMP-PB",
    "name": "Impressão P&B",
    "price": "0.50",
    "stock": 450
  }
}
```

### GET /api/report?from=2025-03-01&to=2025-03-31
```json
// Response 200 (admin only)
{
  "summary": [
    {
      "userId": "...",
      "userName": "João Silva",
      "userCode": "001",
      "totalEntries": 42,
      "totalAmount": "210.00"
    }
  ],
  "entries": [ /* lista completa de todos os lançamentos no período */ ],
  "stockConsumption": [
    {
      "productCode": "IMP-PB",
      "productName": "Impressão P&B",
      "totalQty": 380,
      "totalAmount": "190.00"
    }
  ]
}
```

---

## SERVER ACTIONS

### entry.actions.ts

```typescript
// createEntry(data: CreateEntryInput): Promise<ActionResult>
//   1. Valida com zod
//   2. getSession() → verifica autenticação
//   3. Busca produto pelo code
//   4. Verifica estoque >= qty (erro se não)
//   5. Calcula total = qty * unitPrice
//   6. Transação Prisma:
//      a. Cria Entry (salva productName e unitPrice no momento)
//      b. Decrementa Product.stock -= qty
//   7. revalidatePath('/dashboard')
//   8. Retorna { success: true, entry }

// updateEntry(id, data): Promise<ActionResult>
//   1. Verifica que entry.userId === session.userId
//   2. Verifica que entry.date é hoje (não permite editar dias anteriores)
//   3. Reverte estoque anterior: Product.stock += entry.qty
//   4. Aplica novo estoque: Product.stock -= novaQty
//   5. Atualiza Entry com novos valores + editedAt = now()
//   6. revalidatePath('/dashboard')

// deleteEntry(id): Promise<ActionResult>
//   1. Verifica owner + data de hoje
//   2. Reverte estoque: Product.stock += entry.qty
//   3. Deleta Entry
//   4. revalidatePath('/dashboard')
```

### product.actions.ts

```typescript
// createProduct(data): Promise<ActionResult>
//   Qualquer usuário autenticado (ADMIN ou EMPLOYEE) pode criar produto
//   Valida código único antes de criar

// updateProduct(id, data): Promise<ActionResult>
//   Qualquer usuário autenticado pode editar produto

// adjustStock(id, qty): Promise<ActionResult>
//   Admin only — ajuste manual de estoque (pode ser positivo ou negativo)
//   qty é o novo valor absoluto do estoque, não o delta

// deleteProduct(id): Promise<ActionResult>
//   Admin only — soft delete (active = false), não deleta fisicamente
//   Impede se produto tiver entries nos últimos 30 dias
```

### employee.actions.ts

```typescript
// createEmployee(data): Promise<ActionResult>
//   Admin only
//   data: { name, code, username, password, role }
//   Faz hash da senha com bcrypt (rounds: 12)
//   Valida code e username únicos

// updateEmployee(id, data): Promise<ActionResult>
//   Admin only
//   Se password vier no payload, refaz o hash antes de salvar

// toggleEmployee(id): Promise<ActionResult>
//   Admin only — alterna active true/false (não deleta)
```

---

## HOOK: useProductLookup

```typescript
// src/hooks/useProductLookup.ts
//
// Comportamento:
// - Recebe o valor do input de código
// - Debounce de 400ms
// - Faz GET /api/products?code={code}
// - Retorna { product, loading, error, notFound }
// - Usado no EntryForm para popular nome + preço automaticamente
// - Se o usuário editar o campo de preço após o lookup, seta priceEdited=true
```

---

## TELAS E COMPORTAMENTO DETALHADO

### /login
- Campo: Username
- Campo: Senha (toggle mostrar/ocultar)
- Botão: Entrar
- Erro inline se credenciais inválidas
- Após login: redirect por role (admin → /admin, employee → /dashboard)
- Se já autenticado, redireciona direto (middleware)
- Design: desktop e tablet, centralizado, limpo

### /dashboard (EMPLOYEE)
- Header: nome do funcionário + código + botão sair
- Card de resumo do dia: total de lançamentos e total em R$
- Formulário de novo lançamento:
  - Input "Código do produto" → ao digitar (debounce 400ms) busca e preenche:
    - Nome do produto (readonly)
    - Preço unitário (editável)
    - Estoque disponível (informativo, readonly)
  - Input "Quantidade" (número inteiro, mínimo 1)
  - Input "Preço unitário" (editável, pré-preenchido pelo lookup)
  - Input "Total" (calculado em tempo real, readonly)
  - Campo "Observação" (opcional, textarea)
  - Botão "Registrar"
- Lista de lançamentos do dia (tabela):
  - Colunas: Horário | Produto | Qtd | Preço Unit. | Total | Ações
  - Ações: Editar (modal) | Excluir (confirm dialog)
  - Só permite editar/excluir lançamentos do dia atual
  - Lançamentos de dias anteriores aparecem como readonly
- Paginação ou infinite scroll nos lançamentos

### /admin (ADMIN - Dashboard geral)
- Header com navegação: Dashboard | Funcionários | Produtos | Relatórios | Sair
- Tabela-dashboard de funcionários:
  - Colunas: Código | Nome | Lançamentos hoje | Total hoje (R$) | Lançamentos no mês | Total no mês (R$) | Status
  - Filtro rápido por período (hoje / esta semana / este mês)
  - Clique na linha → abre painel lateral ou página com detalhes do funcionário

### /admin/employees (ADMIN)
- Tabela de funcionários: Código | Nome | Username | Role | Status | Ações
- Botão "Novo Funcionário" → abre modal/drawer com formulário:
  - Nome completo
  - Código (único, ex: "001")
  - Username (único, para login)
  - Senha (campo com toggle)
  - Role (ADMIN ou EMPLOYEE)
- Editar: abre mesmo formulário com dados preenchidos (senha em branco = não altera)
- Toggle ativo/inativo (não deleta)

### /admin/products (ADMIN e EMPLOYEE)
- Tabela de produtos: Código | Nome | Preço | Estoque | Status | Ações
- Botão "Novo Produto" → modal/drawer:
  - Código (único)
  - Nome
  - Preço unitário (R$)
  - Estoque inicial
- Editar: mesmo formulário
- Ajuste de estoque: campo numérico separado (admin only) — define o novo valor absoluto
- Alerta visual quando estoque <= 10 unidades (badge vermelho)
- Toggle ativo/inativo (admin only)

### /admin/reports (ADMIN)
- Filtro de período: date range picker (from / to) + atalhos (este mês, mês anterior)
- Seção 1 — Tabela resumo por funcionário:
  - Colunas: Código | Nome | Qtd Lançamentos | Total (R$)
  - Linha de total geral no rodapé
  - Clique expande inline a lista de lançamentos do funcionário
- Seção 2 — Consumo de estoque:
  - Colunas: Código | Produto | Qtd Consumida | Valor Total (R$)
- Botões de exportação:
  - "Exportar Excel" → gera .xlsx com duas abas (Resumo Funcionários + Detalhe Lançamentos)
  - "Exportar PDF" → gera PDF com cabeçalho, tabelas formatadas e totais

---

## SEED (prisma/seed.ts)

Criar ao executar `npx prisma db seed`:

```
Admin padrão:
  name: "Administrador"
  code: "ADM-001"
  username: "admin"
  password: "admin123" (bcrypt)
  role: ADMIN

Funcionários exemplo:
  { code: "001", username: "joao.silva", name: "João Silva", password: "123456" }
  { code: "002", username: "maria.souza", name: "Maria Souza", password: "123456" }

Produtos exemplo:
  { code: "IMP-PB",   name: "Impressão P&B",        price: 0.25, stock: 500 }
  { code: "IMP-COR",  name: "Impressão Colorida",    price: 1.00, stock: 200 }
  { code: "PLAST-A4", name: "Plastificação A4",      price: 3.50, stock: 100 }
  { code: "PLAST-A3", name: "Plastificação A3",      price: 5.00, stock: 80  }
  { code: "ENC-ESP",  name: "Encadernação Espiral",  price: 8.00, stock: 60  }
  { code: "XEROX-A4", name: "Cópia Simples A4",      price: 0.20, stock: 1000}
```

---

## COMANDOS PARA INICIAR O PROJETO

```bash
# 1. Criar o projeto
npx create-next-app@latest xerox-mvp \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd xerox-mvp

# 2. Instalar dependências
npm install prisma @prisma/client
npm install bcryptjs jose
npm install react-hook-form @hookform/resolvers zod
npm install @tanstack/react-table
npm install xlsx
npm install @react-pdf/renderer
npm install -D @types/bcryptjs

# 3. Instalar shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button input label card table badge
npx shadcn@latest add dialog drawer form select textarea
npx shadcn@latest add dropdown-menu separator skeleton toast
npx shadcn@latest add alert-dialog popover calendar

# 4. Configurar Prisma
npx prisma init
# → colar o schema acima em prisma/schema.prisma
# → configurar DATABASE_URL no .env.local

# 5. Aplicar schema e gerar client
npx prisma db push
npx prisma generate

# 6. Rodar seed
npx prisma db seed

# 7. Iniciar dev
npm run dev
```

---

## OBSERVAÇÕES DE IMPLEMENTAÇÃO

### Transação atômica no lançamento
Usar `prisma.$transaction` para garantir que a criação do Entry e o decremento do estoque ocorram juntos. Se um falhar, o outro é revertido.

```typescript
await prisma.$transaction([
  prisma.entry.create({ data: entryData }),
  prisma.product.update({
    where: { id: productId },
    data: { stock: { decrement: qty } }
  })
])
```

### Verificação de estoque antes da transação
Fazer um `SELECT ... FOR UPDATE` equivalente com Prisma:
```typescript
const product = await prisma.product.findUniqueOrThrow({ where: { code } })
if (product.stock < qty) throw new Error(`Estoque insuficiente. Disponível: ${product.stock}`)
```

### Histórico imutável
Salvar `productName` e `unitPrice` diretamente no `Entry` — não fazer JOIN em relatórios históricos. Isso garante que mudanças futuras no produto não alterem histórico.

### Proteção de rotas (middleware.ts)
```typescript
// Rotas e seus requisitos:
const routes = {
  '/admin':             { roles: ['ADMIN'] },
  '/admin/employees':   { roles: ['ADMIN'] },
  '/admin/reports':     { roles: ['ADMIN'] },
  '/admin/products':    { roles: ['ADMIN', 'EMPLOYEE'] },
  '/dashboard':         { roles: ['ADMIN', 'EMPLOYEE'] },
  '/login':             { public: true },
}
```

### Exportação Excel
Usar a lib `xlsx` (SheetJS) para gerar o arquivo no servidor via Route Handler.
O relatório deve ter duas abas:
- **Resumo**: uma linha por funcionário com totais
- **Detalhes**: todos os lançamentos do período com funcionário, produto, qty, preço, total, data

### Exportação PDF
Usar `@react-pdf/renderer` via Route Handler no servidor.
Layout: cabeçalho com nome da empresa + período, tabela de resumo, tabela de detalhes, rodapé com data de geração.

### Lookup de produto no formulário
O campo de código deve ter comportamento de "lookup inteligente":
- Aceita digitação livre
- Debounce de 400ms antes de chamar a API
- Enquanto busca: spinner no campo
- Produto encontrado: preenche nome (readonly) e preço (editável) com animação suave
- Produto não encontrado: mensagem de erro inline "Código não encontrado"
- Limpar o código: limpa também nome, preço e resets o form

### Permissão de edição de lançamento
Comparar apenas a data (sem hora) para determinar se o lançamento é "do dia":
```typescript
const today = new Date()
today.setHours(0, 0, 0, 0)
const entryDate = new Date(entry.date)
entryDate.setHours(0, 0, 0, 0)
const canEdit = entryDate.getTime() === today.getTime()
```

---

## FUTURAS MELHORIAS (pós-MVP)

- [ ] Multi-tenant: múltiplas lojas/filiais
- [ ] App mobile nativo (React Native / Expo)
- [ ] Notificações de estoque baixo via WhatsApp (Twilio / Z-API)
- [ ] Scanner de código de barras via câmera no mobile
- [ ] Dashboard com gráficos de evolução mensal (recharts)
- [ ] Metas por funcionário e comissão percentual
- [ ] Histórico de alterações de preço por produto
- [ ] Integração com sistema de ponto
- [ ] Backup automático do banco
- [ ] 2FA para o admin

---

## CREDENCIAIS PADRÃO (desenvolvimento)

```
Admin:
  username: admin
  password: admin123

Funcionário teste 1:
  username: joao.silva
  password: 123456

Funcionário teste 2:
  username: maria.souza
  password: 123456
```

---
# FIM DA ESPECIFICAÇÃO
# Versão: 1.0.0 — Março 2025
# Para uso com: Claude Code, Cursor, Windsurf ou qualquer LLM com contexto de arquivo
