'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

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
import { createProduct, updateProduct } from '@/lib/actions/product.actions'

const formSchema = z.object({
  code: z.string().min(1, 'Código obrigatório'),
  name: z.string().min(2, 'Nome muito curto'),
  price: z.string().refine((val) => !isNaN(Number(val)), 'Preço inválido'),
  stock: z.string().refine((val) => !isNaN(Number(val)), 'Estoque inválido'),
})

interface ProductFormProps {
  product?: any
  trigger?: React.ReactNode
  isAdmin?: boolean
  open?: boolean
  setOpen?: (open: boolean) => void
}

export function ProductForm({ 
  product, 
  trigger, 
  isAdmin = true,
  open: externalOpen,
  setOpen: setExternalOpen 
}: ProductFormProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = setExternalOpen !== undefined ? setExternalOpen : setInternalOpen
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: product?.code || '',
      name: product?.name || '',
      price: product?.price ? Number(product.price).toString() : '',
      stock: product?.stock?.toString() || '0',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        code: product?.code || '',
        name: product?.name || '',
        price: product?.price ? Number(product.price).toString() : '',
        stock: product?.stock?.toString() || '0',
      })
    }
  }, [open, product, form])

  async function onSubmit(values: any) {
    setIsLoading(true)
    let result
    
    if (product?.id) {
      result = await updateProduct(product.id, values)
    } else {
      result = await createProduct(values)
    }
    
    setIsLoading(false)

    if (result.success) {
      toast.success(product?.id ? 'Item atualizado!' : 'Item cadastrado!')
      setOpen(false)
      if (!product?.id) form.reset()
    } else {
      toast.error(result.error || 'Erro ao processar')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        <DialogTrigger
          render={
            trigger ? (
              trigger as any
            ) : (
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95">
                <Plus className="mr-2 h-5 w-5" />
                Novo Produto / Serviço
              </Button>
            )
          }
        />
      )}
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {product?.id ? 'Editar Item' : 'Cadastrar Item'}
          </DialogTitle>
          <DialogDescription>
            {product?.id 
              ? 'Atualize as informações do produto ou serviço no sistema.' 
              : 'Adicione um novo produto ou serviço ao catálogo do sistema.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Código Único (Ex: IMP-PB)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Código identificador" 
                      className="rounded-xl h-11 uppercase" 
                      disabled={!!product?.id}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Nome do Produto / Serviço</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Impressão P&B" className="rounded-xl h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Preço Unitário (R$)</FormLabel>
                    <FormControl>
                      <Input placeholder="0.25" className="rounded-xl h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Estoque</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="500" 
                        className="rounded-xl h-11" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-4" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Item'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

