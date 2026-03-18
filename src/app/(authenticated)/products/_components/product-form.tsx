'use client'

import { useEffect, useState } from 'react'
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
  code: z.string().min(1, 'Codigo obrigatorio'),
  name: z.string().min(2, 'Nome muito curto'),
  price: z.string().refine((value) => !isNaN(Number(value)), 'Preco invalido'),
  stock: z.string().refine((value) => !isNaN(Number(value)), 'Estoque invalido'),
})

type ProductFormValues = z.infer<typeof formSchema>

interface ProductFormProps {
  product?: {
    id: string
    code: string
    name: string
    price: number
    stock: number
  }
  trigger?: React.ReactNode
  open?: boolean
  setOpen?: (open: boolean) => void
}

export function ProductForm({ product, trigger, open: externalOpen, setOpen: setExternalOpen }: ProductFormProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = setExternalOpen !== undefined ? setExternalOpen : setInternalOpen

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: product?.code || '',
      name: product?.name || '',
      price: product?.price ? product.price.toString() : '',
      stock: product?.stock?.toString() || '0',
    },
  })

  useEffect(() => {
    if (!open) return

    form.reset({
      code: product?.code || '',
      name: product?.name || '',
      price: product?.price ? product.price.toString() : '',
      stock: product?.stock?.toString() || '0',
    })
  }, [form, open, product])

  async function onSubmit(values: ProductFormValues) {
    setIsLoading(true)
    const result = product?.id ? await updateProduct(product.id, values) : await createProduct(values)
    setIsLoading(false)

    if (result.success) {
      toast.success(product?.id ? 'Item atualizado!' : 'Item cadastrado!')
      setOpen(false)
      if (!product?.id) form.reset()
      return
    }

    toast.error(result.error || 'Erro ao processar')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== null && (
        <DialogTrigger
          render={
            trigger ? (
              trigger as React.ReactElement
            ) : (
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95">
                <Plus className="mr-2 h-5 w-5" />
                Novo Produto / Servico
              </Button>
            )
          }
        />
      )}
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {product?.id ? 'Editar item' : 'Cadastrar item'}
          </DialogTitle>
          <DialogDescription>
            {product?.id ? 'Atualize as informacoes do item.' : 'Adicione um novo item ao catalogo.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Codigo unico</FormLabel>
                  <FormControl>
                    <Input placeholder="IMP-PB" className="rounded-xl h-11 uppercase" disabled={!!product?.id} {...field} />
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
                  <FormLabel className="font-bold">Nome do produto / servico</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Impressao P&B" className="rounded-xl h-11" {...field} />
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
                    <FormLabel className="font-bold">Preco unitario (R$)</FormLabel>
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
                      <Input placeholder="500" className="rounded-xl h-11" {...field} />
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
                'Salvar item'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
