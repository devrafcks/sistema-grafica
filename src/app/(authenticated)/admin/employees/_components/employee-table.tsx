'use client'

import { useState } from 'react'
import { 
  MoreHorizontal, 
  UserX, 
  UserCheck, 
  Edit2, 
  Shield, 
  User as UserIcon 
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { deleteEmployee, toggleEmployeeStatus } from '@/lib/actions/employee.actions'
import { cn } from '@/lib/utils'

interface EmployeeTableProps {
  employees: any[]
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
   const [isLoading, setIsLoading] = useState<string | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<any>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const onToggleStatus = async (id: string, currentStatus: boolean) => {
    setIsLoading(id)
    const result = await toggleEmployeeStatus(id, !currentStatus)
    setIsLoading(null)

    if (result.success) {
      toast.success(`Funcionário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`)
    } else {
      toast.error('Erro ao alterar status')
    }
  }

   const onDeleteEmployee = (employee: any) => {
    setEmployeeToDelete(employee)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!employeeToDelete) return
    
    setIsDeleting(true)
    const result = await deleteEmployee(employeeToDelete.id)
    setIsDeleting(false)
    setIsDeleteOpen(false)
    setEmployeeToDelete(null)

    if (result.success) {
      toast.success('Funcionário excluído com sucesso!')
    } else {
      toast.error(result.error || 'Erro ao excluir funcionário')
    }
  }

  const onEdit = (employee: any) => {
    setEditingEmployee(employee)
    setIsFormOpen(true)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
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
          {employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                Nenhum funcionário cadastrado.
              </TableCell>
            </TableRow>
          ) : (
            employees.map((employee) => (
              <TableRow key={employee.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-9 w-9 rounded-xl flex items-center justify-center border shadow-sm",
                      employee.role === 'ADMIN' ? "bg-amber-50 border-amber-100" : "bg-blue-50 border-blue-100"
                    )}>
                      {employee.role === 'ADMIN' ? (
                        <Shield className="h-4.5 w-4.5 text-amber-600" />
                      ) : (
                        <UserIcon className="h-4.5 w-4.5 text-blue-600" />
                      )}
                    </div>
                    <span className="font-bold text-slate-900 dark:text-zinc-100">{employee.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-slate-600 dark:text-zinc-400">
                  {employee.code}
                </TableCell>
                <TableCell className="text-slate-500 dark:text-zinc-500">
                  @{employee.username}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    "font-bold uppercase tracking-widest text-[10px] py-0.5 px-2",
                    employee.role === 'ADMIN' 
                      ? "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-500" 
                      : "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  )}>
                    {employee.role === 'ADMIN' ? 'Administrador' : 'Funcionário'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", employee.active ? "bg-green-500" : "bg-slate-300")} />
                    <span className={cn("text-xs font-bold uppercase tracking-tight", employee.active ? "text-green-600" : "text-slate-400")}>
                      {employee.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    } />
                    <DropdownMenuContent align="end" className="rounded-xl w-48 p-1.5 shadow-xl">
                      <DropdownMenuLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 py-1.5">Opções</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onEdit(employee)}
                          className="rounded-lg h-9 font-medium cursor-pointer"
                        >
                          <Edit2 className="mr-2 h-4 w-4" /> Editar Perfil
                        </DropdownMenuItem>

                         <DropdownMenuItem 
                          onClick={() => onDeleteEmployee(employee)}
                          className="rounded-lg h-9 font-medium cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600"
                        >
                          <UserX className="mr-2 h-4 w-4" /> Excluir Funcionário
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
       <EmployeeForm 
        employee={editingEmployee}
        open={isFormOpen}
        setOpen={setIsFormOpen}
        trigger={null}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Funcionário?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o acesso de <span className="font-bold">"{employeeToDelete?.name}"</span>? 
              Esta ação removerá permanentemente o acesso deste usuário ao sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
            >
              {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
