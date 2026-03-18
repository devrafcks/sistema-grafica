import { prisma } from '@/lib/prisma'
import { getEmployees } from '@/lib/actions/employee.actions'
import {
  TrendingUp,
  Package,
  DollarSign,
  ArrowUpRight,
  UserCheck
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
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const employees = await getEmployees()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [
    revenueToday,
    revenueMonth,
    activeEmployees,
    totalProducts,
    entriesMonth,
    groupedEmployeeStats,
  ] = await Promise.all([
    prisma.entry.aggregate({
      where: { date: { gte: today } },
      _sum: { total: true }
    }),
    prisma.entry.aggregate({
      where: { date: { gte: firstDayOfMonth } },
      _sum: { total: true }
    }),
    prisma.user.count({
      where: { active: true, role: 'EMPLOYEE' }
    }),
    prisma.product.aggregate({
      _sum: { stock: true }
    }),
    prisma.entry.count({
      where: { date: { gte: firstDayOfMonth } }
    }),
    prisma.entry.groupBy({
      by: ['userId'],
      where: {
        date: { gte: firstDayOfMonth }
      },
      _count: { id: true },
      _sum: { total: true }
    })
  ])

  const employeeStatsMap = new Map(
    groupedEmployeeStats.map((stat) => [
      stat.userId,
      {
        monthlyCount: stat._count.id || 0,
        monthlyTotal: Number(stat._sum.total || 0)
      }
    ])
  )

  const employeeStats = employees
    .filter((employee: any) => employee.role === 'EMPLOYEE')
    .map((employee: any) => {
      const stats = employeeStatsMap.get(employee.id)

      return {
        ...employee,
        monthlyCount: stats?.monthlyCount || 0,
        monthlyTotal: stats?.monthlyTotal || 0
      }
    })

  const stats = [
    {
      label: 'Receita Hoje',
      value: `R$ ${Number(revenueToday._sum.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      trend: `Mês: R$ ${Number(revenueMonth._sum.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      color: 'bg-green-500'
    },
    {
      label: 'Equipe Ativa',
      value: activeEmployees.toString(),
      icon: UserCheck,
      trend: 'Funcionários',
      color: 'bg-blue-500'
    },
    {
      label: 'Itens em Estoque',
      value: (totalProducts._sum.stock || 0).toLocaleString('pt-BR'),
      icon: Package,
      trend: 'Total global',
      color: 'bg-amber-500'
    },
    {
      label: 'Lançamentos / Mês',
      value: entriesMonth.toString(),
      icon: TrendingUp,
      trend: 'Este mês',
      color: 'bg-purple-500'
    },
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 leading-tight">Painel <span className="text-blue-600">Geral</span></h1>
        <p className="text-slate-500 dark:text-zinc-400 text-lg">Resumo operacional e financeiro do sistema.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between mb-4">
              <div className={cn('p-2.5 rounded-xl text-white shadow-lg', stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-lg bg-slate-50 text-slate-500 dark:bg-zinc-900 dark:text-zinc-400">
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">Resumo por Funcionário</h2>
          <Button variant="outline" render={<Link href="/admin/reports" />} className="rounded-xl font-bold text-xs uppercase tracking-widest h-9">
            Ver Relatório Completo <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/50">
              <TableRow>
                <TableHead className="font-bold py-4">Funcionário</TableHead>
                <TableHead className="font-bold">Código</TableHead>
                <TableHead className="font-bold">Lançamentos (Mês)</TableHead>
                <TableHead className="font-bold text-right pr-8 text-blue-600">Total (R$)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-slate-500 italic">
                    Nenhum funcionário para exibir no momento.
                  </TableCell>
                </TableRow>
              ) : (
                employeeStats.map((employee: { id: string; name: string; code: string; monthlyCount: number; monthlyTotal: number }) => (
                  <TableRow key={employee.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-4 font-bold">{employee.name}</TableCell>
                    <TableCell className="text-slate-500">{employee.code}</TableCell>
                    <TableCell className="font-medium text-slate-700 dark:text-zinc-300">
                      {employee.monthlyCount}
                    </TableCell>
                    <TableCell className="text-right pr-8 font-extrabold text-slate-900 dark:text-zinc-100">
                      R$ {employee.monthlyTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

