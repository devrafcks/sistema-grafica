'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  FileText,
  Calendar as CalendarIcon,
  Download,
  Search,
  Filter,
  BarChart3,
  PieChart,
  Users as UsersIcon,
  Loader2,
  ChevronDown,
  ChevronRight,
  Clock,
  TrendingUp,
  DollarSign,
  Activity,
} from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { getEmployees } from '@/lib/actions/employee.actions'
import { getReportData } from '@/lib/actions/report.actions'

export default function ReportsPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [reportData, setReportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFiltering, setIsFiltering] = useState(false)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  const employeesById = useMemo(
    () => new Map(employees.map((e) => [e.id, e])),
    [employees]
  )

  const entriesByUserId = useMemo(() => {
    const map = new Map<string, any[]>()
    for (const entry of reportData?.entries || []) {
      const list = map.get(entry.userId)
      if (list) list.push(entry)
      else map.set(entry.userId, [entry])
    }
    return map
  }, [reportData])

  const fetchData = useCallback(async () => {
    setIsFiltering(true)
    try {
      const data = await getReportData({
        from: dateRange.from,
        to: dateRange.to,
        userId: selectedUser,
      })
      setReportData(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsFiltering(false)
      setIsLoading(false)
    }
  }, [dateRange, selectedUser])

  useEffect(() => {
    getEmployees()
      .then((emps) => setEmployees(emps.filter((e: any) => e.role === 'EMPLOYEE')))
      .catch(console.error)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleExport = (type: 'pdf' | 'excel') => {
    const from = format(dateRange.from, 'yyyy-MM-dd')
    const to = format(dateRange.to, 'yyyy-MM-dd')
    window.location.href = `/api/reports/${type}?from=${from}&to=${to}&userId=${selectedUser}`
  }

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-sm text-slate-400 font-medium animate-pulse">Carregando relatório...</p>
      </div>
    )
  }

  const totalRevenue = reportData?.totalRevenue ?? 0
  const totalEntries = reportData?.totalEntries ?? 0
  const topProduct = reportData?.stockConsumption?.[0]?.name ?? '—'

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Inteligência de Dados</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 leading-tight">
            Relatórios <span className="text-blue-600">Periódicos</span>
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1 text-base md:text-lg">
            Análise completa de produtividade e faturamento por período.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            onClick={() => handleExport('pdf')}
            variant="outline"
            className="rounded-xl font-bold h-10 border-slate-200 hover:bg-slate-50 transition-all active:scale-95 flex-1 sm:flex-none"
          >
            <Download className="mr-2 h-4 w-4" /> PDF
          </Button>
          <Button
            onClick={() => handleExport('excel')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl h-10 shadow-md shadow-green-500/20 transition-all active:scale-95 flex-1 sm:flex-none"
          >
            <FileText className="mr-2 h-4 w-4" /> Excel
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950">
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Intervalo de Datas</label>
              <Popover>
                <PopoverTrigger render={
                  <Button variant="outline" className="w-full justify-start text-left font-bold rounded-xl h-11 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 shadow-sm hover:border-blue-300 transition-colors">
                    <CalendarIcon className="mr-2 h-4 w-4 text-blue-500 shrink-0" />
                    <span className="truncate">
                      {dateRange.from && dateRange.to
                        ? `${format(dateRange.from, 'dd/MM/yy')} — ${format(dateRange.to, 'dd/MM/yy')}`
                        : 'Selecionar datas'}
                    </span>
                  </Button>
                } />
                <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden border-none shadow-2xl" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range: any) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to })
                      }
                    }}
                    numberOfMonths={1}
                    locale={ptBR}
                    className="p-3"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Funcionário</label>
              <Select value={selectedUser} onValueChange={(val) => setSelectedUser(val || 'all')}>
                <SelectTrigger className="w-full font-bold rounded-xl h-11 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 shadow-sm hover:border-blue-300 transition-colors">
                  <Filter className="h-4 w-4 text-blue-500 mr-2 shrink-0" />
                  <SelectValue>
                    {selectedUser === 'all'
                      ? 'Todos'
                      : employeesById.get(selectedUser)?.name || 'Todos'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  <SelectItem value="all" className="font-bold cursor-pointer">Todos os funcionários</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id} className="font-medium cursor-pointer">
                      {emp.name} ({emp.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={fetchData}
              disabled={isFiltering}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-11 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              {isFiltering ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              {isFiltering ? 'Carregando...' : 'Atualizar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Receita no Período</p>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-zinc-50">
            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-600">
              <Activity className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total de Lançamentos</p>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-zinc-50">{totalEntries}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/20 text-purple-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Produto Campeão</p>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-zinc-50 truncate">{topProduct}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        <Card className="rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-950">
          <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/30 border-b border-slate-100 dark:border-zinc-800 p-5">
            <CardTitle className="text-lg font-extrabold flex items-center gap-3 text-slate-800 dark:text-zinc-100">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-blue-600">
                <PieChart className="h-4 w-4" />
              </div>
              Consumo de Estoque
              <Badge variant="outline" className="ml-auto text-[10px] font-bold text-slate-400 border-slate-200">
                {reportData?.stockConsumption.length ?? 0} itens
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="md:hidden divide-y divide-slate-100 dark:divide-zinc-800">
              {!reportData?.stockConsumption.length ? (
                <p className="py-8 text-center text-slate-400 italic text-sm">Nenhum dado no período.</p>
              ) : (
                reportData.stockConsumption.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-zinc-100 text-sm">{item.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Qtde: <span className="font-bold">{item.qty}</span></p>
                    </div>
                    <span className="font-extrabold text-blue-600 text-sm">
                      R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/30">
                  <TableRow>
                    <TableHead className="font-bold py-3.5 px-5 text-[10px] uppercase tracking-widest">Produto / Estoque</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-center">Qtde.</TableHead>
                    <TableHead className="font-bold text-right pr-5 text-[10px] uppercase tracking-widest">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!reportData?.stockConsumption.length ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-28 text-center text-slate-400 italic">
                        Nenhum dado no período.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportData.stockConsumption.map((item: any, i: number) => (
                      <TableRow key={i} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors">
                        <TableCell className="font-bold py-3.5 px-5 text-slate-700 dark:text-zinc-200">{item.name}</TableCell>
                        <TableCell className="text-center font-medium font-mono text-slate-600 dark:text-zinc-400">{item.qty}</TableCell>
                        <TableCell className="text-right pr-5 font-extrabold text-blue-600">
                          R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-950">
          <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/30 border-b border-slate-100 dark:border-zinc-800 p-5">
            <CardTitle className="text-lg font-extrabold flex items-center gap-3 text-slate-800 dark:text-zinc-100">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-xl text-purple-600">
                <UsersIcon className="h-4 w-4" />
              </div>
              Desempenho da Equipe
              <Badge variant="outline" className="ml-auto text-[10px] font-bold text-slate-400 border-slate-200">
                {reportData?.employeePerformance.length ?? 0} funcionários
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="md:hidden divide-y divide-slate-100 dark:divide-zinc-800">
              {!reportData?.employeePerformance.length ? (
                <p className="py-8 text-center text-slate-400 italic text-sm">Nenhum dado no período.</p>
              ) : (
                reportData.employeePerformance.map((e: any) => {
                  const isExpanded = expandedUser === e.id
                  const userEntries = entriesByUserId.get(e.id) || []

                  return (
                    <React.Fragment key={e.id}>
                      <div
                        className={cn(
                          'px-4 py-3 cursor-pointer transition-colors',
                          isExpanded ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-slate-50/50 dark:hover:bg-zinc-900/30'
                        )}
                        onClick={() => setExpandedUser(isExpanded ? null : e.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <ChevronRight className={cn(
                              'h-4 w-4 text-slate-400 shrink-0 transition-transform',
                              isExpanded && 'rotate-90 text-blue-600'
                            )} />
                            <div className="min-w-0">
                              <p className={cn('font-bold text-sm truncate', isExpanded ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-zinc-100')}>{e.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono uppercase">{e.code} · {e.count} lançamentos</p>
                            </div>
                          </div>
                          <span className={cn('font-extrabold text-sm shrink-0', isExpanded ? 'text-blue-600' : 'text-slate-900 dark:text-zinc-100')}>
                            R$ {e.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {isExpanded && userEntries.length > 0 && (
                          <div className="mt-3 space-y-2 pl-6">
                            {userEntries.map((entry: any) => (
                              <div key={entry.id} className="flex items-center justify-between text-xs">
                                <div>
                                  <p className="font-bold text-slate-700 dark:text-zinc-200">{entry.productName}</p>
                                  <p className="text-slate-400 flex items-center gap-1 mt-0.5">
                                    <Clock className="h-3 w-3" />
                                    {format(new Date(entry.createdAt), 'dd/MM HH:mm')} · Qtd: {entry.qty}
                                  </p>
                                </div>
                                <span className="font-extrabold text-blue-600 shrink-0 ml-3">
                                  R$ {Number(entry.total).toFixed(2).replace('.', ',')}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </React.Fragment>
                  )
                })
              )}
              {reportData?.employeePerformance.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-zinc-900/30 border-t-2 border-blue-100 dark:border-blue-900/30">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Total Geral</span>
                  <span className="font-extrabold text-blue-700">
                    R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/30">
                  <TableRow>
                    <TableHead className="font-bold py-3.5 px-5 text-[10px] uppercase tracking-widest">Funcionário</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-center">Lanç.</TableHead>
                    <TableHead className="font-bold text-right pr-5 text-[10px] uppercase tracking-widest">Total Produzido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!reportData?.employeePerformance.length ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-28 text-center text-slate-400 italic">
                        Nenhum dado no período.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportData.employeePerformance.map((e: any) => {
                      const isExpanded = expandedUser === e.id
                      const userEntries = entriesByUserId.get(e.id) || []

                      return (
                        <React.Fragment key={e.id}>
                          <TableRow
                            className={cn(
                              'cursor-pointer transition-colors',
                              isExpanded ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50/50 dark:hover:bg-zinc-900/30'
                            )}
                            onClick={() => setExpandedUser(isExpanded ? null : e.id)}
                          >
                            <TableCell className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  'w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all',
                                  isExpanded ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'
                                )}>
                                  <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', isExpanded && 'rotate-90')} />
                                </div>
                                <div>
                                  <span className={cn('font-bold text-sm', isExpanded ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-zinc-200')}>{e.name}</span>
                                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tight">Matrícula {e.code}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-bold text-slate-600 dark:text-zinc-400 font-mono">{e.count}</TableCell>
                            <TableCell className="text-right pr-5">
                              <span className={cn('font-extrabold text-base', isExpanded ? 'text-blue-600' : 'text-slate-900 dark:text-zinc-100')}>
                                R$ {e.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </TableCell>
                          </TableRow>

                          {isExpanded && (
                            <TableRow className="bg-slate-50/30 dark:bg-zinc-900/20">
                              <TableCell colSpan={3} className="p-0">
                                <div className="px-6 py-4 space-y-3">
                                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500/70">
                                    Detalhamento — {userEntries.length} lançamentos
                                  </p>
                                  <div className="rounded-xl border border-slate-200/60 dark:border-zinc-700/40 bg-white/80 dark:bg-zinc-950/50 overflow-hidden">
                                    <Table>
                                      <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/30">
                                        <TableRow>
                                          <TableHead className="py-2 text-[10px] font-bold uppercase text-slate-400">Data/Hora</TableHead>
                                          <TableHead className="py-2 text-[10px] font-bold uppercase text-slate-400">Produto / Estoque</TableHead>
                                          <TableHead className="py-2 text-[10px] font-bold uppercase text-slate-400 text-center">Qtd.</TableHead>
                                          <TableHead className="py-2 text-[10px] font-bold uppercase text-slate-400 text-right pr-4">Total</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {userEntries.map((entry: any) => (
                                          <TableRow key={entry.id} className="hover:bg-slate-50/40 dark:hover:bg-zinc-900/30">
                                            <TableCell className="py-2.5 text-xs text-slate-500 dark:text-zinc-400">
                                              <div className="flex items-center gap-1.5">
                                                <Clock className="h-3 w-3 opacity-50" />
                                                {format(new Date(entry.createdAt), 'dd/MM HH:mm')}
                                              </div>
                                            </TableCell>
                                            <TableCell className="py-2.5 text-xs font-bold text-slate-700 dark:text-zinc-200">{entry.productName}</TableCell>
                                            <TableCell className="py-2.5 text-xs text-center font-mono font-bold text-slate-600 dark:text-zinc-400">{entry.qty}</TableCell>
                                            <TableCell className="py-2.5 text-xs font-extrabold text-right pr-4 text-blue-600">
                                              R$ {Number(entry.total).toFixed(2).replace('.', ',')}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      )
                    })
                  )}
                  {reportData?.employeePerformance.length > 0 && (
                    <TableRow className="bg-slate-50/50 dark:bg-zinc-900/30 border-t-2 border-slate-200 dark:border-zinc-700">
                      <TableCell className="py-4 px-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Total Geral</TableCell>
                      <TableCell className="text-center font-extrabold text-slate-800 dark:text-zinc-100 font-mono">{totalEntries}</TableCell>
                      <TableCell className="text-right pr-5 font-extrabold text-blue-700 text-base">
                        R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
