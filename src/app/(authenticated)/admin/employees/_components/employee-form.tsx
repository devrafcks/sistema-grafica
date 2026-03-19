'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Loader2, Plus, Edit2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createEmployee, updateEmployee, toggleEmployeeStatus } from '@/lib/actions/employee.actions'

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome obrigatório'),
  username: z.string().min(3, 'Usuário deve ter pelo menos 3 caracteres'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional().or(z.literal('')),
  code: z.string().min(1, 'Código obrigatório'),
  role: z.enum(['ADMIN', 'EMPLOYEE']),
})
.refine((data) => {
  if (!data.id && (!data.password || data.password.length < 6)) {
    return false
  }
  return true
}, {
  message: "Senha deve ter no mínimo 6 caracteres para novos funcionários",
  path: ["password"],
})

interface EmployeeFormProps {
  employee?: {
    id?: string
    name?: string
    username?: string
    code?: string
    role?: 'ADMIN' | 'EMPLOYEE'
    active?: boolean
  }
  trigger?: React.ReactNode
  open?: boolean
  setOpen?: (open: boolean) => void
}

export function EmployeeForm({ 
  employee, 
  trigger,
  open: externalOpen,
  setOpen: setExternalOpen
}: EmployeeFormProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = setExternalOpen !== undefined ? setExternalOpen : setInternalOpen
  const [isLoading, setIsLoading] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: employee?.id || '',
      name: employee?.name || '',
      username: employee?.username || '',
      password: '',
      code: employee?.code || '',
      role: employee?.role || 'EMPLOYEE',
    },
  })
  useEffect(() => {
    if (open) {
      form.reset({
        id: employee?.id || '',
        name: employee?.name || '',
        code: employee?.code || '',
        username: employee?.username || '',
        password: '',
        role: employee?.role || 'EMPLOYEE',
      })
    }
  }, [open, employee, form])

  async function handleToggleStatus() {
    if (!employee?.id) return
    setIsTogglingStatus(true)
    try {
      const result = await toggleEmployeeStatus(employee.id, !employee.active)
      if (result.success) {
        toast.success(employee.active ? 'Acesso desativado.' : 'Acesso ativado.')
        setOpen(false)
      } else {
        toast.error('Erro ao alterar status.')
      }
    } catch {
      toast.error('Erro ao alterar status.')
    } finally {
      setIsTogglingStatus(false)
    }
  }

  async function onSubmit(values: any) {
    setIsLoading(true)
    let result
    
    if (employee?.id) {
      result = await updateEmployee(employee.id, values)
    } else {
      result = await createEmployee(values)
    }
    
    setIsLoading(false)

    if (result.success) {
      toast.success(employee?.id ? 'Funcionário atualizado!' : 'Funcionário criado!')
      setOpen(false)
      if (!employee?.id) form.reset()
    } else {
      toast.error(result.error || 'Erro ao processar solicitação')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        <DialogTrigger
          render={
            trigger ? (
              trigger as any
            ) : (
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95">
                <Plus className="mr-2 h-5 w-5" />
                Novo Funcionário
              </Button>
            )
          }
        />
      )}
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {employee?.id ? 'Editar funcionário' : 'Cadastrar funcionário'}
          </DialogTitle>
          <DialogDescription>
            {employee?.id 
              ? 'Atualize os dados de acesso e permissões do funcionário.' 
              : 'Preencha os dados abaixo para criar um novo acesso ao sistema.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Nome completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João Silva" className="rounded-xl h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Código</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 001" className="rounded-xl h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Cargo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl h-11">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-none shadow-xl">
                        <SelectItem value="EMPLOYEE" className="font-bold cursor-pointer">Funcionário</SelectItem>
                        <SelectItem value="ADMIN" className="font-bold cursor-pointer">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Usuário (login)</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: joao.silva" className="rounded-xl h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">
                      {employee?.id ? 'Alterar Senha' : 'Senha'}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="........" className="rounded-xl h-11" {...field} />
                    </FormControl>
                    {employee?.id && (
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Deixe vazio para manter</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {employee?.id && (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-zinc-700 p-3 bg-slate-50 dark:bg-zinc-900">
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">
                    Status: <span className={employee.active ? 'text-green-600' : 'text-slate-400'}>{employee.active ? 'Ativo' : 'Inativo'}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Funcionários inativos não conseguem fazer login.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleToggleStatus}
                  disabled={isTogglingStatus}
                  className={
                    employee.active
                      ? 'rounded-xl font-bold text-amber-600 border-amber-200 hover:bg-amber-50 hover:border-amber-300'
                      : 'rounded-xl font-bold text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300'
                  }
                >
                  {isTogglingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : (employee.active ? 'Desativar' : 'Ativar')}
                </Button>
              </div>
            )}

            <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-4" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                employee?.id ? 'Atualizar dados' : 'Salvar funcionário'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

