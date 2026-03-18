import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Sidebar } from '@/components/sidebar'
import { prisma } from '@/lib/prisma'

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  // Graceful fallback for older sessions without names
  const displayName = session.name || (await prisma.user.findUnique({
    where: { id: session.sub },
    select: { name: true }
  }))?.name || session.sub

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950">
      <Sidebar 
        role={session.role} 
        userName={displayName} 
        userCode={session.code} 
      />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
