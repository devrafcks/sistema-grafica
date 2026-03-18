'use client'

import { useState, useEffect } from 'react'
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

interface ProductTableProps {
  products: any[]
  isAdmin: boolean
}

export function ProductTable({ products, isAdmin }: ProductTableProps) {
  const [search, setSearch] = useState('')
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const onDeleteProduct = (product: any) => {
    setProductToDelete(product)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return
    
    setIsDeleting(true)
    const result = await deleteProduct(productToDelete.id)
    setIsDeleting(false)
    setIsDeleteOpen(false)
    setProductToDelete(null)

    if (result.success) {
      toast.success('Item excluído com sucesso!')
    } else {
      toast.error(result.error || 'Erro ao excluir item')
    }
  }

  const onEdit = (product: any) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar por nome ou código..."
          className="pl-10 rounded-xl bg-white border-slate-200"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button 
            onClick={() => setSearch('')}
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
              <TableHead className="font-bold">Código</TableHead>
              <TableHead className="font-bold">Preço Unitário</TableHead>
              <TableHead className="font-bold">Estoque</TableHead>
            <TableHead className="text-right font-bold pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500 italic">
                  {search ? 'Nenhum item encontrado para esta busca.' : 'Nenhum produto ou serviço cadastrado.'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => {
                const isLowStock = product.stock <= 5
                const isActive = product.active !== false
                
                return (
                  <TableRow key={product.id} className={cn(
                    "hover:bg-slate-50/50 transition-colors group",
                    !isActive && "opacity-60 bg-slate-50/30"
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
                      R$ {Number(product.price).toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-extrabold text-sm",
                          isLowStock ? "text-red-600" : "text-slate-900 dark:text-zinc-100"
                        )}>
                          {product.stock}
                        </span>
                        {isLowStock && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold uppercase tracking-tight">
                            <AlertTriangle className="h-3 w-3" /> Estoque Baixo
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
                          <DropdownMenuLabel className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 py-1.5">Gerenciar Item</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onEdit(product)}
                            className="rounded-lg h-9 font-medium cursor-pointer"
                          >
                            <Edit2 className="mr-2 h-4 w-4" /> Editar Detalhes
                          </DropdownMenuItem>

                          {isAdmin && (
                            <DropdownMenuItem 
                              onClick={() => onDeleteProduct(product)}
                              className="rounded-lg h-9 font-medium cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir Item
                            </DropdownMenuItem>
                          )}
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-2">
          <p className="text-sm text-slate-500 font-medium italic">
            Mostrando <span className="font-extrabold text-blue-600">{paginatedProducts.length}</span> de <span className="font-extrabold text-slate-900">{filteredProducts.length}</span> produtos
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-xl font-bold"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
            </Button>
            <div className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-extrabold text-blue-600">
              {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl font-bold"
            >
              Próximo <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <ProductForm 
        product={editingProduct} 
        isAdmin={isAdmin} 
        open={isFormOpen} 
        setOpen={setIsFormOpen} 
        trigger={null}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <span className="font-bold">"{productToDelete?.name}"</span>? 
              Esta ação não pode ser desfeita e removerá o item permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
            >
              {isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
