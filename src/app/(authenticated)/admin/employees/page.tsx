import { getEmployees } from '@/lib/actions/employee.actions'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { EmployeeTable } from './_components/employee-table'
import { EmployeeForm } from './_components/employee-form'
import { Users } from 'lucide-react'

export default async function EmployeesPage() {
  const employees = await getEmployees()

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
            <Users className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Painel de Controle</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50">Funcionários</h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1">Gerencie os acessos e permissões da sua equipe.</p>
        </div>
        
        <EmployeeForm />
      </div>

      <EmployeeTable employees={employees} />
    </div>
  )
}
