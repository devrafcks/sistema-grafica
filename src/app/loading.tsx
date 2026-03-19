import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 rounded-2xl bg-blue-100 dark:bg-blue-900/20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
        <div className="text-center">
          <p className="font-extrabold text-slate-900 dark:text-zinc-50">Carregando...</p>
          <p className="text-sm text-slate-400 mt-0.5">Aguarde um momento</p>
        </div>
      </div>
    </div>
  )
}
