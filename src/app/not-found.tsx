import Link from 'next/link'
import { FileX2, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-2xl bg-blue-100 dark:bg-blue-900/20 text-blue-600">
            <FileX2 className="h-12 w-12" />
          </div>
        </div>

        <p className="text-7xl font-black text-blue-600 leading-none mb-2">404</p>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-zinc-50 mb-2">
          Página não encontrada
        </h1>
        <p className="text-slate-500 dark:text-zinc-400 mb-8">
          O endereço que você tentou acessar não existe ou foi removido.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            className="rounded-xl font-bold h-11"
            render={<Link href="/dashboard" />}
          >
            <Home className="mr-2 h-4 w-4" /> Ir para o início
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold h-11 shadow-lg shadow-blue-500/20"
            render={<Link href="/admin" />}
          >
            Painel Admin
          </Button>
        </div>
      </div>
    </div>
  )
}
