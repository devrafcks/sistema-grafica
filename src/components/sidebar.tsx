'use client'

import { useState, useEffect } from 'react'
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
  ShieldCheck,
  UserCircle,
  Menu,
  X,
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
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

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
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {!mobileOpen && (
        <button
          className="fixed top-4 left-4 z-40 md:hidden p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-md transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5 text-slate-600 dark:text-zinc-300" />
        </button>
      )}

      <aside
        className={cn(
          'w-68 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-screen z-50 shadow-sm',
          'fixed inset-y-0 left-0 transition-transform duration-300 ease-in-out',
          'md:sticky md:top-0 md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <div className="p-5 md:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-xl bg-blue-600 w-11 h-11 shadow-lg shadow-blue-500/20 ring-4 ring-blue-50 dark:ring-blue-900/10 shrink-0">
              <Printer className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-50 leading-tight">Xerox Manager</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest mt-0.5">Gestão Digital</span>
            </div>
          </div>

          <button
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg transition-colors"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4 md:mt-6 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center justify-between px-3.5 py-3 text-sm font-semibold rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-100',
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors duration-200',
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 dark:text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-blue-400',
                    )}
                  />
                  {item.title}
                </div>
                {isActive && <ChevronRight className="h-4 w-4 text-white/70" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-zinc-800/60 bg-slate-50/50 dark:bg-zinc-900/20 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div
              className={cn(
                'h-10 w-10 rounded-xl flex items-center justify-center border-2 shadow-sm transition-colors shrink-0',
                role === 'ADMIN'
                  ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50'
                  : 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50',
              )}
            >
              {role === 'ADMIN' ? (
                <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-500" />
              ) : (
                <UserCircle className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">{userName}</span>
              <span
                className={cn(
                  'text-[10px] font-extrabold uppercase tracking-widest',
                  role === 'ADMIN' ? 'text-amber-600 dark:text-amber-500' : 'text-blue-600 dark:text-blue-400',
                )}
              >
                {role === 'ADMIN' ? 'Administrador' : 'Funcionário'}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start text-slate-500 font-bold hover:text-red-600 hover:bg-red-50 dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sair do sistema
          </Button>
        </div>
      </aside>
    </>
  )
}
