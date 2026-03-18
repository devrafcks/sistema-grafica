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
  ChevronRight
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
import { ProductForm } from './product-form'
import { deleteProduct } from '@/lib/actions/product.actions'

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

export function ProductTable({ products }: ProductTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<ProductRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const normalizedSearch = search.trim().toLowerCase()
  const filteredProducts = useMemo(() => {
    if (!normalizedSearch) return products

    return products.filter((product) =>
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.code.toLowerCase().includes(normalizedSearch)
    )
  }, [normalizedSearch, products])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

  const confirmDelete = async () => {
    if (!productToDelete) return

    setIsDeleting(true)
    const result = await deleteProduct(productToDelete.id)
    setIsDeleting(false)
    setIsDeleteOpen(false)

    if (result.success) {
      setProductToDelete(null)
      toast.success('Item excluido com sucesso!')
      router.refresh()
      return
    }

    toast.error(result.error || 'Erro ao excluir item')
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar por nome ou codigo..."
          className="pl-10 rounded-xl bg-white border-slate-200"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setCurrentPage(1)
          }}
        />
        {search && (
          <button
            onClick={() => {
              setSearch('')
              setCurrentPage(1)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-md text-slate-400"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/50">
            <TableRow>
              <TableHead className="font-bold py-4">Item</TableHead>
              <TableHead className="font-bold">Codigo</TableHead>
              <TableHead className="font-bold">Preco Unitario</TableHead>
              <TableHead className="font-bold">Estoque</TableHead>
              <TableHead className="text-right font-bold pr-6">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500 italic">
                  {search ? 'Nenhum item encontrado para esta busca.' : 'Nenhum produto ou servico cadastrado.'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => {
                const isLowStock = product.stock <= 5
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
                          isLowStock ? 'text-red-600' : 'text-slate-900 dark:text-zinc-100'
                        )}>
                          {product.stock}
                        </span>
                        {isLowStock && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-tight">
                            <AlertTriangle className="h-3 w-3" /> Estoque baixo
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="rounded-xl w-48 p-1.5 shadow-xl">
                          <DropdownMenuLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 py-1.5">Gerenciar item</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingProduct(product)
                              setIsFormOpen(true)
                            }}
                            className="rounded-lg h-9 font-medium cursor-pointer"
                          >
                            <Edit2 className="mr-2 h-4 w-4" /> Editar detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setProductToDelete(product)
                              setIsDeleteOpen(true)
                            }}
                            className="rounded-lg h-9 font-medium cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {filteredProducts.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-2">
          <p className="text-sm text-slate-500 font-medium italic">
            Mostrando <span className="font-extrabold text-blue-600">{paginatedProducts.length}</span> de <span className="font-extrabold text-slate-900">{filteredProducts.length}</span> produtos
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safePage === 1}
              className="rounded-xl font-bold"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
            </Button>
            <div className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-extrabold text-blue-600">
              {safePage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={safePage === totalPages}
              className="rounded-xl font-bold"
            >
              Proximo <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <ProductForm product={editingProduct ?? undefined} open={isFormOpen} setOpen={setIsFormOpen} trigger={null} />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir item?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <span className="font-bold">&quot;{productToDelete?.name}&quot;</span>? Esta acao nao pode ser desfeita.
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
