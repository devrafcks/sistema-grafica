# Xerox Manager

Sistema de gestão de produção para gráficas e serviços de xerox. Substitui o vale-caixa em papel e as planilhas manuais por um fluxo digital onde cada funcionário registra seus lançamentos durante o dia, e o administrador acompanha a produção em tempo real com geração de relatórios em Excel e PDF.

---

## Visão geral

O sistema possui dois perfis de acesso:

**Administrador** — gerencia funcionários, produtos e estoque, visualiza o desempenho de toda a equipe e exporta relatórios por período.

**Funcionário** — registra lançamentos do dia informando o código do produto (o sistema preenche nome e preço automaticamente), acompanha seus próprios registros e o histórico acumulado.

---

## Stack

| Camada         | Tecnologia                                                 |
| -------------- | ---------------------------------------------------------- |
| Framework      | Next.js 16 (App Router, Server Components, Server Actions) |
| Linguagem      | TypeScript                                                 |
| Banco de dados | PostgreSQL via Neon (serverless)                           |
| ORM            | Prisma 5                                                   |
| Autenticação | JWT em cookie httpOnly + tabela de sessões no banco       |
| Interface      | shadcn/ui + Tailwind CSS v4                                |
| Formulários   | react-hook-form + Zod                                      |
| Exportação   | SheetJS (Excel) + @react-pdf/renderer (PDF)                |
| Hash de senha  | bcryptjs                                                   |

---

## Funcionalidades

**Lançamentos**

- Busca de produto por código com preenchimento automático de nome e preço
- Quantidade e preço unitário editáveis antes de confirmar
- Estoque decrementado automaticamente a cada lançamento
- Edição e exclusão permitidas apenas no mesmo dia

**Estoque**

- Cadastro de produtos com código único, preço e quantidade
- Alerta visual para estoque baixo (5 unidades ou menos)
- Ajuste manual de estoque pelo administrador

**Relatórios**

- Filtro por intervalo de datas
- Resumo de produção por funcionário com total de lançamentos e valor
- Consumo de estoque por produto no período
- Exportação em Excel com formatação profissional (3 abas: Lançamentos, Equipe, Estoque)
- Exportação em PDF

**Administração**

- Cadastro e gerenciamento de funcionários (nome, código, usuário, senha, cargo)
- Ativação e desativação de contas sem excluir o histórico

---

## Estrutura de pastas

```
src/
├── app/
│   ├── layout.tsx                          # Layout raiz com fonte e widget de acessibilidade
│   ├── (auth)/login/                       # Tela de login
│   ├── (authenticated)/
│   │   ├── dashboard/                      # Dashboard do funcionário
│   │   ├── products/                       # Gestão de produtos e estoque
│   │   └── admin/
│   │       ├── page.tsx                    # Painel administrativo
│   │       ├── employees/                  # Gestão de funcionários
│   │       └── reports/                    # Relatórios por período
│   └── api/
│       ├── products/lookup/                # Busca de produto por código
│       └── reports/
│           ├── excel/                      # Geração do .xlsx
│           └── pdf/                        # Geração do PDF
├── components/
│   ├── sidebar.tsx                         # Navegação lateral responsiva
│   └── accessibility-widget.tsx            # Widget SeeB de acessibilidade
├── lib/
│   ├── auth.ts                             # Verificação de sessão JWT
│   ├── prisma.ts                           # Singleton do PrismaClient
│   └── actions/                            # Server Actions (auth, entry, product, employee, report)
└── hooks/
    └── useProductLookup.ts                 # Lookup de produto com debounce
```

---

## Responsividade e acessibilidade

O sistema é totalmente responsivo. Em telas menores, tabelas são substituídas por cards e a navegação utiliza menu lateral deslizante. O widget de acessibilidade SeeB está integrado em todas as páginas com suporte a daltonismo, contraste, tamanho de texto, espaçamento e guia de leitura.

---

## Segurança

- Senhas armazenadas com bcrypt (12 rounds)
- Sessões invalidáveis via tabela no banco de dados
- Todas as Server Actions verificam autenticação e, onde necessário, autorização de administrador
- JWT_SECRET obrigatório — a aplicação não inicia sem a variável configurada
- Erros internos não são expostos ao cliente
- Filtros de relatório validados com Zod (intervalo máximo de 366 dias)
