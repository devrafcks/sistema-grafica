import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Sidebar } from '@/components/sidebar'

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const displayName = session.name || session.code

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950">
      <Sidebar
        role={session.role}
        userName={displayName}
        userCode={session.code}
      />
      <main className="flex-1 min-w-0 p-4 pt-16 md:pt-6 md:p-8">
        {children}
      </main>
    </div>
  )
}
