'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  Package,
  AlertTriangle,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProductForm } from './product-form'
import { deleteProduct, updateProduct } from '@/lib/actions/product.actions'

interface ProductRow {
  id: string
  code: string
  name: string
  price: number
  stock: number
  active: boolean
}

interface ProductTableProps {
  products: ProductRow[]
}

type StatusFilter = 'todos' | 'ativo' | 'inativo'
type StockFilter = 'todos' | 'baixo' | 'zerado'

export function ProductTable({ products }: ProductTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')
  const [stockFilter, setStockFilter] = useState<StockFilter>('todos')
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<ProductRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const counts = useMemo(() => ({
    ativos: products.filter((p) => p.active).length,
    inativos: products.filter((p) => !p.active).length,
    estoqueBaixo: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
    semEstoque: products.filter((p) => p.stock === 0).length,
  }), [products])

  const normalizedSearch = search.trim().toLowerCase()
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (normalizedSearch && !product.name.toLowerCase().includes(normalizedSearch) && !product.code.toLowerCase().includes(normalizedSearch)) {
        return false
      }
      if (statusFilter === 'ativo' && !product.active) return false
      if (statusFilter === 'inativo' && product.active) return false
      if (stockFilter === 'zerado' && product.stock !== 0) return false
      if (stockFilter === 'baixo' && (product.stock > 5 || product.stock === 0)) return false
      return true
    })
  }, [normalizedSearch, statusFilter, stockFilter, products])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

  const resetPage = () => setCurrentPage(1)
  const hasActiveFilters = normalizedSearch || statusFilter !== 'todos' || stockFilter !== 'todos'

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('todos')
    setStockFilter('todos')
    setCurrentPage(1)
  }

  const handleToggleStatus = async (product: ProductRow) => {
    setTogglingId(product.id)
    try {
      const result = await updateProduct(product.id, { name: product.name, active: !product.active })
      if (result.success) {
        toast.success(product.active ? 'Produto desativado.' : 'Produto ativado.')
        router.refresh()
      } else {
        toast.error(result.error || 'Erro ao alterar status do produto.')
      }
    } catch {
      toast.error('Erro ao alterar status do produto.')
    } finally {
      setTogglingId(null)
    }
  }

  const confirmDelete = async () => {
    if (!productToDelete) return

    setIsDeleting(true)
    const result = await deleteProduct(productToDelete.id)
    setIsDeleting(false)
    setIsDeleteOpen(false)

    if (result.success) {
      setProductToDelete(null)
      toast.success('Produto excluído com sucesso!')
      router.refresh()
      return
    }

    toast.error(result.error || 'Erro ao excluir produto')
  }

  const ProductActions = ({ product }: { product: ProductRow }) => (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg" disabled={togglingId === product.id}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      } />
      <DropdownMenuContent align="end" className="rounded-xl w-52 p-1.5 shadow-xl">
        <DropdownMenuLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 py-1.5">Gerenciar produto</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => { setEditingProduct(product); setIsFormOpen(true) }}
          className="rounded-lg h-9 font-medium cursor-pointer"
        >
          <Edit2 className="mr-2 h-4 w-4" /> Editar detalhes
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleToggleStatus(product)}
          className={cn(
            'rounded-lg h-9 font-medium cursor-pointer',
            product.active
              ? 'text-amber-600 focus:bg-amber-50 focus:text-amber-700'
              : 'text-green-600 focus:bg-green-50 focus:text-green-700'
          )}
        >
          {product.active
            ? <><ToggleLeft className="mr-2 h-4 w-4" /> Desativar produto</>
            : <><ToggleRight className="mr-2 h-4 w-4" /> Ativar produto</>
          }
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => { setProductToDelete(product); setIsDeleteOpen(true) }}
          className="rounded-lg h-9 font-medium cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Excluir produto
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou código..."
            className="pl-10 rounded-xl bg-white border-slate-200"
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage() }}
          />
          {search && (
            <button
              onClick={() => { setSearch(''); resetPage() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-md text-slate-400"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as StatusFilter); resetPage() }}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl bg-white border-slate-200 font-medium">
            <SelectValue>
              {statusFilter === 'todos' && `Todos os produtos (${products.length})`}
              {statusFilter === 'ativo' && `Ativos (${counts.ativos})`}
              {statusFilter === 'inativo' && `Inativos (${counts.inativos})`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-xl border-none">
            <SelectItem value="todos" className="font-medium cursor-pointer">
              Todos os produtos ({products.length})
            </SelectItem>
            <SelectItem value="ativo" className="font-medium cursor-pointer">
              Ativos ({counts.ativos})
            </SelectItem>
            <SelectItem value="inativo" className="font-medium cursor-pointer">
              Inativos ({counts.inativos})
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={stockFilter} onValueChange={(v) => { setStockFilter(v as StockFilter); resetPage() }}>
          <SelectTrigger className="w-full sm:w-52 rounded-xl bg-white border-slate-200 font-medium">
            <SelectValue>
              {stockFilter === 'todos' && 'Qualquer nível de estoque'}
              {stockFilter === 'baixo' && `Estoque baixo ≤ 5 (${counts.estoqueBaixo})`}
              {stockFilter === 'zerado' && `Sem estoque (${counts.semEstoque})`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-xl border-none">
            <SelectItem value="todos" className="font-medium cursor-pointer">
              Qualquer nível de estoque
            </SelectItem>
            <SelectItem value="baixo" className="font-medium cursor-pointer">
              Estoque baixo ≤ 5 ({counts.estoqueBaixo})
            </SelectItem>
            <SelectItem value="zerado" className="font-medium cursor-pointer">
              Sem estoque ({counts.semEstoque})
            </SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="rounded-xl border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shrink-0"
          >
            <X className="h-4 w-4 mr-1.5" /> Limpar filtros
          </Button>
        )}
      </div>

      <div className="md:hidden space-y-3">
        {paginatedProducts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-10 text-center text-slate-400 italic">
            {hasActiveFilters ? 'Nenhum produto encontrado para os filtros aplicados.' : 'Nenhum produto cadastrado no estoque.'}
          </div>
        ) : (
          paginatedProducts.map((product) => {
            const isLowStock = product.stock > 0 && product.stock <= 5
            const isOutOfStock = product.stock === 0
            const isActive = product.active !== false

            return (
              <div
                key={product.id}
                className={cn(
                  'rounded-2xl border bg-white dark:bg-zinc-950 shadow-sm p-4',
                  isActive ? 'border-slate-200 dark:border-zinc-800' : 'border-slate-200 dark:border-zinc-800 opacity-60',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 dark:bg-zinc-900 dark:border-zinc-800 flex items-center justify-center text-slate-400 shrink-0">
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-zinc-100 truncate">{product.name}</p>
                      {!isActive && (
                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-tight">Inativo</span>
                      )}
                    </div>
                  </div>
                  <ProductActions product={product} />
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-2 gap-y-2 gap-x-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Código</p>
                    <Badge variant="outline" className="font-mono font-bold text-[10px] py-0 px-2 bg-slate-50 text-slate-500 mt-0.5">
                      {product.code}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Preço unitário</p>
                    <p className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Estoque</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn(
                        'font-extrabold text-sm',
                        isOutOfStock ? 'text-red-700' : isLowStock ? 'text-red-600' : 'text-slate-900 dark:text-zinc-100'
                      )}>
                        {product.stock} unidades
                      </span>
                      {isOutOfStock ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 border border-red-200 text-red-700 text-[10px] font-bold uppercase">
                          <AlertTriangle className="h-3 w-3" /> Sem estoque
                        </div>
                      ) : isLowStock && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold uppercase">
                          <AlertTriangle className="h-3 w-3" /> Estoque baixo
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="hidden md:block rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/50">
            <TableRow>
              <TableHead className="font-bold py-4">Produto / Estoque</TableHead>
              <TableHead className="font-bold">Código</TableHead>
              <TableHead className="font-bold">Preço unitário</TableHead>
              <TableHead className="font-bold">Estoque</TableHead>
              <TableHead className="text-right font-bold pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500 italic">
                  {hasActiveFilters ? 'Nenhum produto encontrado para os filtros aplicados.' : 'Nenhum produto cadastrado no estoque.'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => {
                const isLowStock = product.stock > 0 && product.stock <= 5
                const isOutOfStock = product.stock === 0
                const isActive = product.active !== false

                return (
                  <TableRow key={product.id} className={cn(
                    'hover:bg-slate-50/50 transition-colors group',
                    !isActive && 'opacity-60 bg-slate-50/30'
                  )}>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                          <Package className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-zinc-100">{product.name}</span>
                          {!isActive && (
                            <span className="text-[10px] text-red-500 font-bold uppercase tracking-tight">Inativo</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono font-bold text-[10px] py-0 px-2 bg-slate-50 text-slate-500">
                        {product.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-slate-700 dark:text-zinc-300">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'font-extrabold text-sm',
                          isOutOfStock ? 'text-red-700' : isLowStock ? 'text-red-600' : 'text-slate-900 dark:text-zinc-100'
                        )}>
                          {product.stock}
                        </span>
                        {isOutOfStock ? (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100 border border-red-200 text-red-700 text-[10px] font-bold uppercase tracking-tight">
                            <AlertTriangle className="h-3 w-3" /> Sem estoque
                          </div>
                        ) : isLowStock && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-tight">
                            <AlertTriangle className="h-3 w-3" /> Estoque baixo
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <ProductActions product={product} />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {filteredProducts.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-2">
          <p className="text-sm text-slate-500 font-medium italic text-center sm:text-left">
            Mostrando <span className="font-extrabold text-blue-600">{paginatedProducts.length}</span> de <span className="font-extrabold text-slate-900 dark:text-zinc-100">{filteredProducts.length}</span> produtos
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safePage === 1}
              className="rounded-xl font-bold"
            >
              <ChevronLeft className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>
            <div className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl text-sm font-extrabold text-blue-600 min-w-[60px] text-center">
              {safePage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={safePage === totalPages}
              className="rounded-xl font-bold"
            >
              <span className="hidden sm:inline">Próximo</span>
              <ChevronRight className="h-4 w-4 sm:ml-1" />
            </Button>
          </div>
        </div>
      )}

      <ProductForm product={editingProduct ?? undefined} open={isFormOpen} setOpen={setIsFormOpen} trigger={null} />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir <span className="font-bold">&quot;{productToDelete?.name}&quot;</span>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl">
              {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
