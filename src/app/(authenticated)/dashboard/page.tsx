import { getDashboardStats, getRecentEntries, getChartData } from '@/lib/actions/entry.actions'
import { getLowStockProducts } from '@/lib/actions/product.actions'
import { EntryForm } from './_components/entry-form'
import { RevenueLineChart } from '@/components/dashboard-charts'
import {
  TrendingUp,
  DollarSign,
  History,
  Package,
  Activity,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const ENTRIES_PER_PAGE = 10

export default async function EmployeeDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10))

  const [stats, { entries: recentEntries, total: totalEntries }, chartData, lowStockProducts] = await Promise.all([
    getDashboardStats(),
    getRecentEntries(ENTRIES_PER_PAGE, page),
    getChartData(),
    getLowStockProducts(5),
  ])

  const totalPages = Math.max(1, Math.ceil(totalEntries / ENTRIES_PER_PAGE))
  const safePage = Math.min(page, totalPages)

  const dashboardCards = [
    {
      label: 'Produção hoje (R$)',
      value: `R$ ${Number(stats?.totalRevenue || 0).toFixed(2).replace('.', ',')}`,
      icon: DollarSign,
      color: 'bg-green-500',
      description: 'Total acumulado no dia'
    },
    {
      label: 'Lançamentos hoje',
      value: stats?.totalEntries || 0,
      icon: Activity,
      color: 'bg-blue-500',
      description: 'Quantidade de produtos registrados'
    },
    {
      label: 'Mais realizado',
      value: stats?.topService || '---',
      icon: TrendingUp,
      color: 'bg-purple-500',
      description: 'Produto campeão do dia'
    },
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-brand-dark dark:text-zinc-50 leading-tight">Meu <span className="text-brand-primary">Dashboard</span></h1>
          <p className="text-brand-muted dark:text-zinc-400 text-base md:text-lg">Resumo do seu desempenho e atividades diárias.</p>
        </div>

        <EntryForm />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {dashboardCards.map((card, i) => (
          <div key={i} className="group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-4 mb-3">
              <div className={cn("p-2.5 rounded-xl text-white shadow-lg", card.color)}>
                <card.icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold text-brand-muted dark:text-zinc-400 uppercase tracking-widest">{card.label}</p>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-brand-dark dark:text-zinc-100">{card.value}</h3>
              <p className="text-xs text-slate-400 mt-1">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      {lowStockProducts.length > 0 && (
        <Alert variant="warning" className="rounded-2xl border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/30">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-400 font-bold">Atenção: Estoque Baixo</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-500 font-medium">
            Existem {lowStockProducts.length} itens com estoque crítico (≤ 5 unidades). 
            <Link href="/products" className="ml-1 underline font-bold underline-offset-4">Ver produtos</Link>
          </AlertDescription>
        </Alert>
      )}

      <Card className="rounded-2xl border-brand-border overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold text-brand-dark dark:text-zinc-50 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-primary" /> Desempenho nos últimos 7 dias
            </CardTitle>
            <CardDescription className="text-brand-muted font-medium">Sua produção diária em reais (R$)</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <RevenueLineChart data={chartData} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-brand-dark dark:text-zinc-50 flex items-center gap-2">
            <History className="h-6 w-6 text-brand-primary" /> Histórico de lançamentos
          </h2>
          <Badge variant="outline" className="px-3 py-1 font-bold text-xs bg-brand-bg-subtle text-brand-muted border-brand-border">
            {totalEntries} registros
          </Badge>
        </div>

        <div className="md:hidden space-y-3">
          {recentEntries.length === 0 ? (
            <div className="rounded-2xl border border-brand-border bg-white dark:border-zinc-800 dark:bg-zinc-950 p-10 text-center">
              <Activity className="h-10 w-10 opacity-20 mx-auto mb-2 text-slate-400" />
              <p className="text-slate-400 italic">Nenhum lançamento registrado.</p>
              <p className="text-xs text-slate-400 mt-1">Use o botão &quot;Novo lançamento&quot; para começar.</p>
            </div>
          ) : (
            recentEntries.map((entry: any) => (
              <div key={entry.id} className="rounded-2xl border border-brand-border bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-brand-bg-subtle border border-brand-border flex items-center justify-center text-brand-muted shrink-0">
                    <Package className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-brand-dark dark:text-zinc-100 truncate">{entry.productName}</p>
                    {entry.note && (
                      <p className="text-[10px] text-brand-muted font-medium italic truncate">{entry.note}</p>
                    )}
                  </div>
                  <span className="font-extrabold text-brand-dark dark:text-zinc-100 shrink-0">
                    R$ {Number(entry.total).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-brand-border/50 flex items-center justify-between">
                  <span className="text-xs text-brand-muted font-medium">
                    {new Date(entry.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                    Qtd: {entry.qty}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block rounded-2xl border border-brand-border bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <Table>
            <TableHeader className="bg-brand-bg-subtle/50 dark:bg-zinc-900/50">
              <TableRow>
                <TableHead className="font-bold py-4">Produto / Estoque</TableHead>
                <TableHead className="font-bold">Horário</TableHead>
                <TableHead className="font-bold text-center">Qtd.</TableHead>
                <TableHead className="font-bold text-right pr-8 text-brand-primary">Total (R$)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Activity className="h-10 w-10 opacity-20" />
                      <p className="italic">Nenhum lançamento registrado.</p>
                      <p className="text-xs">Use o botão &quot;Novo lançamento&quot; para começar.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                recentEntries.map((entry: any) => (
                  <TableRow key={entry.id} className="hover:bg-brand-bg-subtle/50 transition-colors group">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-brand-bg-subtle border border-brand-border flex items-center justify-center text-brand-muted group-hover:bg-blue-50 group-hover:text-brand-primary transition-colors">
                          <Package className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-brand-dark dark:text-zinc-100">{entry.productName}</p>
                          {entry.note && (
                            <p className="text-[10px] text-brand-muted font-medium italic">{entry.note}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-brand-muted text-sm font-medium">
                      {new Date(entry.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="text-center font-extrabold text-slate-700">{entry.qty}</TableCell>
                    <TableCell className="text-right pr-8 font-extrabold text-brand-dark dark:text-zinc-100">
                      R$ {Number(entry.total).toFixed(2).replace('.', ',')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-2">
            <p className="text-sm text-slate-500 font-medium">
              Página <span className="font-extrabold text-blue-600">{safePage}</span> de <span className="font-extrabold text-slate-900 dark:text-zinc-100">{totalPages}</span>
              <span className="ml-2 text-slate-400">· {totalEntries} registros no total</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold"
                disabled={safePage === 1}
                render={safePage > 1 ? <Link href={`/dashboard?page=${safePage - 1}`} /> : undefined}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
              </Button>

              <div className="px-4 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl text-sm font-extrabold text-blue-600">
                {safePage} / {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold"
                disabled={safePage === totalPages}
                render={safePage < totalPages ? <Link href={`/dashboard?page=${safePage + 1}`} /> : undefined}
              >
                Próximo <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
