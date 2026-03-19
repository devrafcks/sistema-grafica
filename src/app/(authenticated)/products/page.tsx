import { redirect } from 'next/navigation'
import { getProducts } from '@/lib/actions/product.actions'
import { getSession } from '@/lib/auth'
import { ProductTable } from './_components/product-table'
import { ProductForm } from './_components/product-form'
import { Package, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default async function ProductsPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const products = await getProducts()
  const lowStockItems = products.filter((product) => product.stock <= 5)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
            <Package className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Controle de inventário</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 leading-tight">Produtos / <span className="text-blue-600">Estoque</span></h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1 text-base md:text-lg">Gerencie seu catálogo de produtos e níveis de estoque.</p>
        </div>

        <ProductForm />
      </div>

      {lowStockItems.length > 0 && (
        <Alert variant="warning" className="border-amber-200 bg-amber-50/50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Atenção: estoque baixo</AlertTitle>
          <AlertDescription className="text-amber-700">
            Existem {lowStockItems.length} itens com estoque igual ou inferior a 5 unidades.
          </AlertDescription>
        </Alert>
      )}

      <ProductTable products={products} />
    </div>
  )
}
