'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MoreHorizontal,
  UserX,
  Edit2,
  Shield,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  UserCheck,
  UserMinus,
} from 'lucide-react'
import { toast } from 'sonner'
import { EmployeeForm } from './employee-form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { deleteEmployee, toggleEmployeeStatus } from '@/lib/actions/employee.actions'
import { cn } from '@/lib/utils'

interface EmployeeRow {
  id: string
  name: string
  code: string
  username: string
  role: 'ADMIN' | 'EMPLOYEE'
  active: boolean
}

interface EmployeeTableProps {
  employees: EmployeeRow[]
}

const ITEMS_PER_PAGE = 8
type CargoFilter = 'todos' | 'ADMIN' | 'EMPLOYEE'
type StatusFilter = 'todos' | 'ativo' | 'inativo'

export function EmployeeTable({ employees }: EmployeeTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [cargoFilter, setCargoFilter] = useState<CargoFilter>('todos')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingEmployee, setEditingEmployee] = useState<EmployeeRow | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const counts = useMemo(() => ({
    admins: employees.filter((e) => e.role === 'ADMIN').length,
    funcionarios: employees.filter((e) => e.role === 'EMPLOYEE').length,
    ativos: employees.filter((e) => e.active).length,
    inativos: employees.filter((e) => !e.active).length,
  }), [employees])

  const normalizedSearch = search.trim().toLowerCase()
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      if (normalizedSearch && !e.name.toLowerCase().includes(normalizedSearch) && !e.code.toLowerCase().includes(normalizedSearch) && !e.username.toLowerCase().includes(normalizedSearch)) {
        return false
      }
      if (cargoFilter !== 'todos' && e.role !== cargoFilter) return false
      if (statusFilter === 'ativo' && !e.active) return false
      if (statusFilter === 'inativo' && e.active) return false
      return true
    })
  }, [normalizedSearch, cargoFilter, statusFilter, employees])

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedEmployees = filteredEmployees.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  )

  const resetPage = () => setCurrentPage(1)
  const hasActiveFilters = normalizedSearch || cargoFilter !== 'todos' || statusFilter !== 'todos'

  const clearFilters = () => {
    setSearch('')
    setCargoFilter('todos')
    setStatusFilter('todos')
    setCurrentPage(1)
  }

  const handleToggleStatus = async (employee: EmployeeRow) => {
    setTogglingId(employee.id)
    try {
      const result = await toggleEmployeeStatus(employee.id, !employee.active)
      if (result.success) {
        toast.success(employee.active ? 'Acesso desativado.' : 'Acesso ativado.')
        router.refresh()
      } else {
        toast.error('Erro ao alterar status do funcionário.')
      }
    } catch {
      toast.error('Erro ao alterar status do funcionário.')
    } finally {
      setTogglingId(null)
    }
  }

  const confirmDelete = async () => {
    if (!employeeToDelete) return

    setIsDeleting(true)
    const result = await deleteEmployee(employeeToDelete.id)
    setIsDeleting(false)
    setIsDeleteOpen(false)

    if (result.success) {
      setEmployeeToDelete(null)
      toast.success('Funcionário excluído com sucesso!')
      router.refresh()
      return
    }

    toast.error(result.error || 'Erro ao excluir funcionário')
  }

  const EmployeeActions = ({ employee }: { employee: EmployeeRow }) => (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg" disabled={togglingId === employee.id}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      } />
      <DropdownMenuContent align="end" className="rounded-xl w-52 p-1.5 shadow-xl">
        <DropdownMenuLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 py-1.5">Opções</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => { setEditingEmployee(employee); setIsFormOpen(true) }}
          className="rounded-lg h-9 font-medium cursor-pointer"
        >
          <Edit2 className="mr-2 h-4 w-4" /> Editar perfil
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleToggleStatus(employee)}
          className={cn(
            'rounded-lg h-9 font-medium cursor-pointer',
            employee.active
              ? 'text-amber-600 focus:bg-amber-50 focus:text-amber-700'
              : 'text-green-600 focus:bg-green-50 focus:text-green-700'
          )}
        >
          {employee.active
            ? <><UserMinus className="mr-2 h-4 w-4" /> Desativar acesso</>
            : <><UserCheck className="mr-2 h-4 w-4" /> Ativar acesso</>
          }
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => { setEmployeeToDelete(employee); setIsDeleteOpen(true) }}
          className="rounded-lg h-9 font-medium cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600"
        >
          <UserX className="mr-2 h-4 w-4" /> Excluir funcionário
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome, código ou usuário..."
            className="pl-10 rounded-xl bg-white border-slate-200"
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage() }}
          />
          {search && (
            <button
              onClick={() => { setSearch(''); resetPage() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-md text-slate-400"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <Select value={cargoFilter} onValueChange={(v) => { setCargoFilter(v as CargoFilter); resetPage() }}>
          <SelectTrigger className="w-full sm:w-52 rounded-xl bg-white border-slate-200 font-medium">
            <SelectValue>
              {cargoFilter === 'todos' && `Todos os cargos (${employees.length})`}
              {cargoFilter === 'EMPLOYEE' && `Funcionários (${counts.funcionarios})`}
              {cargoFilter === 'ADMIN' && `Administradores (${counts.admins})`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-xl border-none">
            <SelectItem value="todos" className="font-medium cursor-pointer">
              Todos os cargos ({employees.length})
            </SelectItem>
            <SelectItem value="EMPLOYEE" className="font-medium cursor-pointer">
              Funcionários ({counts.funcionarios})
            </SelectItem>
            <SelectItem value="ADMIN" className="font-medium cursor-pointer">
              Administradores ({counts.admins})
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as StatusFilter); resetPage() }}>
          <SelectTrigger className="w-full sm:w-44 rounded-xl bg-white border-slate-200 font-medium">
            <SelectValue>
              {statusFilter === 'todos' && 'Ativos e inativos'}
              {statusFilter === 'ativo' && `Somente ativos (${counts.ativos})`}
              {statusFilter === 'inativo' && `Somente inativos (${counts.inativos})`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-xl border-none">
            <SelectItem value="todos" className="font-medium cursor-pointer">
              Ativos e inativos
            </SelectItem>
            <SelectItem value="ativo" className="font-medium cursor-pointer">
              Somente ativos ({counts.ativos})
            </SelectItem>
            <SelectItem value="inativo" className="font-medium cursor-pointer">
              Somente inativos ({counts.inativos})
            </SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="rounded-xl border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shrink-0"
          >
            <X className="h-4 w-4 mr-1.5" /> Limpar filtros
          </Button>
        )}
      </div>

      <div className="md:hidden space-y-3">
        {paginatedEmployees.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-10 text-center text-slate-400 italic">
            {hasActiveFilters ? 'Nenhum funcionário encontrado para os filtros aplicados.' : 'Nenhum funcionário cadastrado.'}
          </div>
        ) : (
          paginatedEmployees.map((employee) => (
            <div
              key={employee.id}
              className="rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    'h-10 w-10 rounded-xl flex items-center justify-center border shadow-sm shrink-0',
                    employee.role === 'ADMIN' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'
                  )}>
                    {employee.role === 'ADMIN' ? (
                      <Shield className="h-5 w-5 text-amber-600" />
                    ) : (
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-zinc-100 truncate">{employee.name}</p>
                    <p className="text-xs text-slate-400 dark:text-zinc-500">@{employee.username}</p>
                  </div>
                </div>
                <EmployeeActions employee={employee} />
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  Código: <span className="font-bold text-slate-700 dark:text-zinc-300">{employee.code}</span>
                </span>

                <Badge variant="outline" className={cn(
                  'font-bold uppercase tracking-widest text-[10px] py-0.5 px-2',
                  employee.role === 'ADMIN'
                    ? 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-500'
                    : 'border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                )}>
                  {employee.role === 'ADMIN' ? 'Administrador' : 'Funcionário'}
                </Badge>

                <div className="flex items-center gap-1.5">
                  <div className={cn('h-2 w-2 rounded-full', employee.active ? 'bg-green-500' : 'bg-slate-300')} />
                  <span className={cn('text-xs font-bold uppercase tracking-tight', employee.active ? 'text-green-600' : 'text-slate-400')}>
                    {employee.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden md:block rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/50">
            <TableRow>
              <TableHead className="font-bold py-4">Funcionário</TableHead>
              <TableHead className="font-bold">Código</TableHead>
              <TableHead className="font-bold">Usuário</TableHead>
              <TableHead className="font-bold">Cargo</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-right font-bold pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-500 italic">
                  {hasActiveFilters ? 'Nenhum funcionário encontrado para os filtros aplicados.' : 'Nenhum funcionário cadastrado.'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedEmployees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-9 w-9 rounded-xl flex items-center justify-center border shadow-sm',
                        employee.role === 'ADMIN' ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'
                      )}>
                        {employee.role === 'ADMIN' ? (
                          <Shield className="h-4 w-4 text-amber-600" />
                        ) : (
                          <UserIcon className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-zinc-100">{employee.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-600 dark:text-zinc-400">{employee.code}</TableCell>
                  <TableCell className="text-slate-500 dark:text-zinc-500">@{employee.username}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      'font-bold uppercase tracking-widest text-[10px] py-0.5 px-2',
                      employee.role === 'ADMIN'
                        ? 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-500'
                        : 'border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    )}>
                      {employee.role === 'ADMIN' ? 'Administrador' : 'Funcionário'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn('h-2 w-2 rounded-full', employee.active ? 'bg-green-500' : 'bg-slate-300')} />
                      <span className={cn('text-xs font-bold uppercase tracking-tight', employee.active ? 'text-green-600' : 'text-slate-400')}>
                        {employee.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <EmployeeActions employee={employee} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredEmployees.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-2">
          <p className="text-sm text-slate-500 font-medium italic">
            Mostrando <span className="font-extrabold text-blue-600">{paginatedEmployees.length}</span> de <span className="font-extrabold text-slate-900 dark:text-zinc-100">{filteredEmployees.length}</span> funcionários
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="rounded-xl font-bold"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
            </Button>
            <div className="px-4 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl text-sm font-extrabold text-blue-600">
              {safePage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="rounded-xl font-bold"
            >
              Próximo <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <EmployeeForm employee={editingEmployee ?? undefined} open={isFormOpen} setOpen={setIsFormOpen} trigger={null} />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir funcionário?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir <span className="font-bold">&quot;{employeeToDelete?.name}&quot;</span>? Esta ação remove o acesso e os lançamentos vinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl">
              {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
