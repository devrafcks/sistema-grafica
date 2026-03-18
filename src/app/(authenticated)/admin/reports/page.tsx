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
  ExternalLink
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'
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
import { getEmployees } from '@/lib/actions/employee.actions'
import { getReportData } from '@/lib/actions/report.actions'

export default function ReportsPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [reportData, setReportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFiltering, setIsFiltering] = useState(false)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  })
  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  const employeesById = useMemo(() => {
    return new Map(employees.map((employee) => [employee.id, employee]))
  }, [employees])

  const entriesByUserId = useMemo(() => {
    const groupedEntries = new Map<string, any[]>()

    for (const entry of reportData?.entries || []) {
      const userEntries = groupedEntries.get(entry.userId)

      if (userEntries) {
        userEntries.push(entry)
      } else {
        groupedEntries.set(entry.userId, [entry])
      }
    }

    return groupedEntries
  }, [reportData])

  const fetchData = useCallback(async () => {
    setIsFiltering(true)
    try {
      const data = await getReportData({
        from: dateRange.from,
        to: dateRange.to,
        userId: selectedUser
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
    async function loadEmployees() {
      try {
        const emps = await getEmployees()
        setEmployees(emps.filter((e: any) => e.role === 'EMPLOYEE'))
      } catch (error) {
        console.error("Erro ao carregar funcionários:", error)
      }
    }
    loadEmployees()
  }, []) // Fetch employees only once

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
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Inteligência de Dados</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 leading-tight">Relatórios <span className="text-blue-600">Periódicos</span></h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1">Análise completa de produtividade e faturamento por período.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => handleExport('pdf')}
            variant="outline" 
            className="rounded-xl font-bold h-11 border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
          >
            <Download className="mr-2 h-4 w-4" /> Exportar PDF
          </Button>
          <Button 
            onClick={() => handleExport('excel')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl h-11 shadow-md shadow-green-500/20 transition-all active:scale-95"
          >
            <FileText className="mr-2 h-4 w-4" /> Exportar Excel
          </Button>
        </div>
      </div>
      <Card className="border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-visible border-none bg-white/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Intervalo de Datas</label>
              <Popover>
                <PopoverTrigger
                render={
                  <Button variant="outline" className="w-full justify-start text-left font-bold rounded-2xl h-12 bg-white border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                    <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                    {dateRange.from && dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yy")} - {format(dateRange.to, "dd/MM/yy")}
                      </>
                    ) : (
                      <span>Selecionar datas</span>
                    )}
                  </Button>
                }
              />
                <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden border-none shadow-2xl" align="start">
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
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Funcionário</label>
              <Select value={selectedUser} onValueChange={(val: string | null) => setSelectedUser(val || 'all')}>
                <SelectTrigger className="w-full font-bold rounded-2xl h-12 bg-white border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                  <Filter className="h-4 w-4 text-blue-500 mr-2" />
                  <SelectValue>
                    {selectedUser === 'all' 
                      ? 'Todos os funcionários' 
                      : employeesById.get(selectedUser)?.name || 'Todos os funcionários'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-xl">
                  <SelectItem value="all" className="font-bold cursor-pointer">Todos os funcionários</SelectItem>
                  {employees.map(emp => (
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl h-12 shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
            >
              {isFiltering ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="mr-2 h-4 w-4" />} 
              Atualizar Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white/80">
          <CardHeader className="bg-slate-50/30 border-b border-slate-100/50 p-6">
            <CardTitle className="text-xl font-extrabold flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                <PieChart className="h-5 w-5" />
              </div>
              Consumo de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-bold py-4 px-6 text-[10px] uppercase tracking-widest">Produto / Serviço</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest text-center">Qtde.</TableHead>
                  <TableHead className="font-bold text-right pr-6 text-[10px] uppercase tracking-widest">Total Gerado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData?.stockConsumption.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-slate-400 italic">
                      Nenhum dado no período.
                    </TableCell>
                  </TableRow>
                ) : (
                  reportData?.stockConsumption.map((item: any, i: number) => (
                    <TableRow key={i} className="hover:bg-blue-50/20 transition-colors">
                      <TableCell className="font-bold py-4 px-6 text-slate-700">{item.name}</TableCell>
                      <TableCell className="text-center font-medium font-mono text-slate-600">{item.qty}</TableCell>
                      <TableCell className="text-right pr-6 font-extrabold text-blue-600">
                        R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white/80">
          <CardHeader className="bg-slate-50/30 border-b border-slate-100/50 p-6">
            <CardTitle className="text-xl font-extrabold flex items-center gap-3 text-slate-800">
              <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
                <UsersIcon className="h-5 w-5" />
              </div>
              Desempenho da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-bold py-4 px-6 text-[10px] uppercase tracking-widest">Funcionário</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest text-center text-slate-500">Lanç.</TableHead>
                  <TableHead className="font-bold text-right pr-6 text-[10px] uppercase tracking-widest">Total Produzido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData?.employeePerformance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-slate-400 italic">
                      Nenhum dado no período.
                    </TableCell>
                  </TableRow>
                ) : (
                  reportData?.employeePerformance.map((e: any) => {
                    const isExpanded = expandedUser === e.id
                    const userEntries = entriesByUserId.get(e.id) || []
                    
                    return (
                      <React.Fragment key={e.id}>
                        <TableRow 
                          className={cn(
                            "group cursor-pointer transition-colors transition-all",
                            isExpanded ? "bg-blue-50/40 dark:bg-blue-900/10" : "hover:bg-slate-50/50"
                          )}
                          onClick={() => setExpandedUser(isExpanded ? null : e.id)}
                        >
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200",
                                isExpanded ? "bg-blue-600 text-white rotate-90" : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                              )}>
                                <ChevronRight className="h-4 w-4" />
                              </div>
                              <div className="flex flex-col">
                                <span className={cn("font-bold transition-colors", isExpanded ? "text-blue-700" : "text-slate-700")}>{e.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase font-extrabold">Matrícula {e.code}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-bold text-slate-600 font-mono">{e.count}</TableCell>
                          <TableCell className="text-right pr-6">
                            <div className={cn("font-black tracking-tight text-lg transition-colors", isExpanded ? "text-blue-600" : "text-slate-900")}>
                              R$ {e.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {isExpanded && (
                          <TableRow className="bg-slate-50/30 border-b-0 animate-in slide-in-from-top-2 duration-300">
                            <TableCell colSpan={3} className="p-0">
                              <div className="px-6 py-4 pb-8 space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500/70">Detalhamento de Lançamentos</h4>
                                  <span className="text-[10px] font-bold text-slate-400">{userEntries.length} itens encontrados</span>
                                </div>
                                <div className="rounded-2xl border border-slate-200/60 bg-white/60 shadow-inner overflow-hidden">
                                  <Table>
                                    <TableHeader className="bg-slate-100/30">
                                      <TableRow className="hover:bg-transparent border-slate-100/50">
                                        <TableHead className="py-2 text-[10px] font-black uppercase text-slate-400">Data/Hora</TableHead>
                                        <TableHead className="py-2 text-[10px] font-black uppercase text-slate-400">Serviço/Produto</TableHead>
                                        <TableHead className="py-2 text-[10px] font-black uppercase text-slate-400 text-center">Qtd.</TableHead>
                                        <TableHead className="py-2 text-[10px] font-black uppercase text-slate-400 text-right pr-4">Total</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {userEntries.map((entry: any) => (
                                        <TableRow key={entry.id} className="hover:bg-slate-50/40 border-slate-100/30">
                                          <TableCell className="py-2.5 text-xs font-medium text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                              <Clock className="h-3 w-3 text-slate-300" />
                                              {format(new Date(entry.createdAt), "dd/MM HH:mm")}
                                            </div>
                                          </TableCell>
                                          <TableCell className="py-2.5 text-xs font-bold text-slate-700">{entry.productName}</TableCell>
                                          <TableCell className="py-2.5 text-xs font-mono text-center text-slate-600 font-bold">{entry.qty}</TableCell>
                                          <TableCell className="py-2.5 text-xs font-extrabold text-right pr-4 text-blue-600">
                                            R$ {Number(entry.total).toFixed(2)}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                                {userEntries.length > 5 && (
                                  <p className="text-[9px] text-center text-slate-400 font-medium">Mostrando todos os registros deste funcionário no período.</p>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    )
                  })
                )}
                {reportData?.employeePerformance.length > 0 && (
                  <TableRow className="bg-slate-50/50 font-black border-t-2 border-slate-100">
                    <TableCell className="py-4 px-6 uppercase text-slate-500 text-xs">Total Geral</TableCell>
                    <TableCell className="text-center text-slate-900 font-mono">{reportData.totalEntries}</TableCell>
                    <TableCell className="text-right pr-6 text-blue-700 text-lg">
                      R$ {reportData.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


