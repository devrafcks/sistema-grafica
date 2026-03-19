import { Metadata } from "next"
import LoginForm from "./components/login-form"
import { CheckCircle2, Package } from "lucide-react"

export const metadata: Metadata = {
  title: "Acesso - Xerox Manager",
  description: "Faça login no sistema de gestão de vale-caixa",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-background text-foreground h-full w-full">
      <div className="flex flex-col flex-1 min-h-screen sm:flex-[0.8] lg:flex-1 items-center justify-center p-8 bg-white dark:bg-zinc-950">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <div className="flex flex-col space-y-2 mb-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-brand-primary/10 text-brand-primary shadow-sm border border-brand-primary/20">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-brand-dark">
                  Xerox<span className="text-brand-primary">Manager</span>
                </h1>
                <p className="text-xs font-bold text-brand-muted uppercase tracking-[0.2em]">Eficiência & Controle</p>
              </div>
            </div>

            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>

          <LoginForm />
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-1 relative bg-brand-primary overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'radial-gradient(var(--color-brand-primary-light-alpha) 2px, transparent 2px)',
            backgroundSize: '30px 30px'
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-brand-primary/30 blur-[120px] pointer-events-none z-0"></div>

        <div className="relative z-10 w-full flex flex-col justify-center px-16 xl:px-24">
          <div className="space-y-1 mb-8">
            <h2 className="text-2xl font-bold text-white">Bem-vindo de volta</h2>
            <p className="text-brand-primary-light">Acesse sua conta para gerenciar sua empresa</p>
          </div>
          <div className="max-w-xl">
            <div className="space-y-8 text-white">
              <div className="flex gap-4 items-start">
                <div className="bg-white/20 rounded-full p-1 mt-0.5">
                  <CheckCircle2 className="h-5 w-5 text-white shrink-0" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Lançamentos rápidos</h3>
                  <p className="text-brand-primary-light text-sm mt-1">Registre cópias, impressões e encadernações em segundos.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-white/20 rounded-full p-1 mt-0.5">
                  <CheckCircle2 className="h-5 w-5 text-white shrink-0" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Controle de estoque</h3>
                  <p className="text-brand-primary-light text-sm mt-1">O sistema reduz automaticamente o estoque a cada operação.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-white/20 rounded-full p-1 mt-0.5">
                  <CheckCircle2 className="h-5 w-5 text-white shrink-0" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-white">Relatórios em tempo real</h3>
                  <p className="text-brand-primary-light text-sm mt-1">Dashboard e fechamento automático com exportação em PDF.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
