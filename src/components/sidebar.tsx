'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  LogOut, 
  Printer,
  ChevronRight,
  User as UserIcon,
  ShieldCheck,
  UserCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/lib/actions/auth.actions'

interface SidebarItem {
  title: string
  href: string
  icon: any
}

interface SidebarProps {
  role: 'ADMIN' | 'EMPLOYEE'
  userName: string
  userCode: string
}

export function Sidebar({ role, userName, userCode }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const adminItems: SidebarItem[] = [
    { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { title: 'Funcionários', href: '/admin/employees', icon: Users },
    { title: 'Produtos / Estoque', href: '/products', icon: Package },
    { title: 'Relatórios', href: '/admin/reports', icon: FileText },
  ]

  const employeeItems: SidebarItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Produtos / Estoque', href: '/products', icon: Package },
  ]


  const items = role === 'ADMIN' ? adminItems : employeeItems

  const handleLogout = async () => {
    await logoutAction()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-68 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-screen sticky top-0 transition-all duration-300 shadow-sm z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="flex items-center justify-center rounded-xl bg-blue-600 w-11 h-11 shadow-lg shadow-blue-500/20 ring-4 ring-blue-50 dark:ring-blue-900/10">
          <Printer className="h-6 w-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-50 leading-tight">Xerox Manager</span>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest mt-0.5">Gestão Digital</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-6">
        {items.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-3.5 py-3 text-sm font-semibold rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-100"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn(
                  "h-[20px] w-[20px] transition-all duration-300",
                  isActive ? "text-white" : "text-slate-400 dark:text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                )} />
                {item.title}
              </div>
              {isActive && <ChevronRight className="h-4 w-4 text-white/70" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-zinc-800/60 bg-slate-50/50 dark:bg-zinc-900/20 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center border-2 shadow-sm transition-colors",
            role === 'ADMIN' 
              ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50" 
              : "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50"
          )}>
            {role === 'ADMIN' ? (
              <ShieldCheck className="h-5.5 w-5.5 text-amber-600 dark:text-amber-500" />
            ) : (
              <UserCircle className="h-5.5 w-5.5 text-blue-600 dark:text-blue-500" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">{userName}</span>
            <span className={cn(
              "text-[10px] font-extrabold uppercase tracking-widest",
              role === 'ADMIN' ? "text-amber-600 dark:text-amber-500" : "text-blue-600 dark:text-blue-400"
            )}>
              {role === 'ADMIN' ? 'Administrador' : 'Funcionário'}
            </span>
          </div>
        </div>

        <Button 
          variant="ghost" 
          className="w-full justify-start text-slate-500 font-bold hover:text-red-600 hover:bg-red-50 dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-[20px] w-[20px]" />
          Sair do sistema
        </Button>
      </div>
    </aside>
  )
}

