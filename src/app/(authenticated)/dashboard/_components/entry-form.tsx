'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Loader2, Plus, Calculator, Package, Search } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useProductLookup, useProductSearch } from '@/hooks/useProductLookup'
import { createEntry } from '@/lib/actions/entry.actions'

const formSchema = z.object({
  productQuery: z.string().min(1, 'Digite o nome ou cdigo do produto'),
  productId: z.string().min(1, 'Produto no encontrado'),
  qty: z.string().refine((val) => Number(val) > 0, 'Quantidade deve ser maior que zero'),
  unitPrice: z.string().refine((val) => Number(val) >= 0, 'Preo invlido'),
  note: z.string().optional(),
})

export function EntryForm() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productQuery: '',
      productId: '',
      qty: '1',
      unitPrice: '0',
      note: '',
    },
  })

  const productQuery = form.watch('productQuery')
  const { products: suggestions, loading: searchLoading } = useProductSearch(productQuery)
  const { product: exactProduct } = useProductLookup(productQuery)

  useEffect(() => {
    if (exactProduct && !form.getValues('productId')) {
      form.setValue('productId', exactProduct.id)
      form.setValue('unitPrice', exactProduct.price.toString())
    }
  }, [exactProduct, form])

  const handleSelectProduct = (p: any) => {
    form.setValue('productId', p.id)
    form.setValue('productQuery', p.name)
    form.setValue('unitPrice', p.price.toString())
    setShowSuggestions(false)
  }

  const qty = form.watch('qty')
  const unitPrice = form.watch('unitPrice')
  const productId = form.watch('productId')
  const selectedProduct = productId ? suggestions.find(s => s.id === productId) || exactProduct : null

  const total = (Number(qty) * Number(unitPrice)).toFixed(2)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    const result = await createEntry({
      productId: values.productId,
      qty: values.qty,
      unitPrice: values.unitPrice,
      note: values.note
    })
    setIsLoading(false)

    if (result.success) {
      toast.success('Lanamento realizado com sucesso!')
      setOpen(false)
      form.reset()
    } else {
      toast.error(result.error || 'Erro ao realizar lanamento')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-12 px-6 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
            <Plus className="mr-2 h-5 w-5" />
            Novo Lanamento
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Novo Servio</DialogTitle>
          <DialogDescription>
            Registre um novo servio prestado ou venda realizada.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="relative">
              <FormField
                control={form.control}
                name="productQuery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold flex justify-between">
                      Produto ou Servio
                      {searchLoading && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Digite o nome ou cdigo..." 
                          className="rounded-xl h-11 pr-10" 
                          {...field}
                          autoComplete="off"
                          onFocus={() => setShowSuggestions(true)}
                          onChange={(e) => {
                            field.onChange(e)
                            form.setValue('productId', '') // Clear ID when typing
                            setShowSuggestions(true)
                          }}
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="max-h-60 overflow-y-auto p-1">
                    {suggestions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                        onClick={() => handleSelectProduct(p)}
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 group-hover:text-blue-600">{p.name}</span>
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">Cd: {p.code}</span>
                        </div>
                        <div className="text-right">
                          <span className="block font-extrabold text-blue-600">R$ {Number(p.price).toFixed(2)}</span>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Estoque: {p.stock}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedProduct && (
              <div className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-bold text-blue-700 uppercase">
                    Estoque Disponvel
                  </span>
                </div>
                <span className="text-sm font-extrabold text-blue-800">
                  {selectedProduct.stock} unidades
                </span>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="qty"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Quantidade</FormLabel>
                    <FormControl>
                      <Input type="number" className="rounded-xl h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Preo Unit. (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" className="rounded-xl h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel className="font-bold">Observao (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Cpia colorida" className="rounded-xl h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl flex items-center justify-between border border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-slate-500">
                <Calculator className="h-4 w-4" />
                <span className="text-xs font-bold uppercase">Total do Lanamento</span>
              </div>
              <span className="text-xl font-extrabold text-blue-600">
                R$ {total.replace('.', ',')}
              </span>
            </div>

            <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-4" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Finalizar Lanamento'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

