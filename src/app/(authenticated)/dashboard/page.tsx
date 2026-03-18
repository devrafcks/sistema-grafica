import { getDashboardStats, getRecentEntries } from '@/lib/actions/entry.actions'
import { EntryForm } from './_components/entry-form'
import { 
  TrendingUp, 
  DollarSign, 
  History, 
  ChevronRight,
  Package,
  Activity
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
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function EmployeeDashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const [stats, recentEntries] = await Promise.all([
    getDashboardStats(),
    getRecentEntries(10),
  ])

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
      description: 'Quantidade de serviços registrados'
    },
    { 
      label: 'Mais realizado', 
      value: stats?.topService || '---', 
      icon: TrendingUp, 
      color: 'bg-purple-500',
      description: 'Serviço campeão do dia'
    },
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-brand-dark dark:text-zinc-50 leading-tight">Meu <span className="text-brand-primary">Dashboard</span></h1>
          <p className="text-brand-muted dark:text-zinc-400 text-lg">Resumo do seu desempenho e atividades diárias.</p>
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-brand-dark dark:text-zinc-50 flex items-center gap-2">
            <History className="h-6 w-6 text-brand-primary" /> Histórico recente
          </h2>
          <Badge variant="outline" className="px-3 py-1 font-bold text-xs bg-brand-bg-subtle text-brand-muted border-brand-border">
            Últimos 10 lançamentos
          </Badge>
        </div>

        <div className="rounded-2xl border border-brand-border bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <Table>
            <TableHeader className="bg-brand-bg-subtle/50 dark:bg-zinc-900/50">
              <TableRow>
                <TableHead className="font-bold py-4">Serviço / produto</TableHead>
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
                      <p className="italic">Nenhum lançamento registrado recentemente.</p>
                      <p className="text-xs">Use o botão "Novo lançamento" para começar.</p>
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
      </div>
    </div>
  )
}

