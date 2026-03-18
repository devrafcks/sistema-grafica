'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { Decimal } from '@prisma/client/runtime/library'
import { z } from 'zod'

const productIdSchema = z.string().min(1)
const createProductSchema = z.object({
  code: z.string().trim().min(1).max(40),
  name: z.string().trim().min(2).max(120),
  price: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().nonnegative(),
})
const updateProductSchema = z.object({
  name: z.string().trim().min(2).max(120),
  price: z.coerce.number().nonnegative().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  active: z.boolean().optional(),
})

function serializeProduct(product: {
  id: string
  code: string
  name: string
  price: Decimal
  stock: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}) {
  return {
    ...product,
    price: Number(product.price)
  }
}

export async function createProduct(data: { code: string; name: string; price: string; stock: string }) {
  const session = await getSession()
  if (!session) throw new Error('Nao autorizado')

  const parsed = createProductSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: 'Dados invalidos do produto.' }
  }
  const { code, name, price, stock } = parsed.data

  try {
    const product = await prisma.product.create({
      data: {
        code,
        name,
        price: new Decimal(price),
        stock,
        active: true,
      },
    })

    revalidatePath('/products')
    revalidatePath('/dashboard')

    return {
      success: true,
      product: serializeProduct(product)
    }
  } catch (error: unknown) {
    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') {
      return { success: false, error: 'Codigo de produto ja cadastrado.' }
    }

    return { success: false, error: 'Erro ao criar produto.' }
  }
}

export async function getProducts() {
  const session = await getSession()
  if (!session) throw new Error('Nao autorizado')

  const products = await prisma.product.findMany({
    where: session.role === 'ADMIN' ? {} : { active: true },
    select: {
      id: true,
      code: true,
      name: true,
      price: true,
      stock: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { name: 'asc' },
  })

  return products.map(serializeProduct)
}

export async function updateProduct(
  id: string,
  data: { name: string; price?: string; stock?: string; active?: boolean }
) {
  const session = await getSession()
  if (!session) throw new Error('Nao autorizado')

  const parsedId = productIdSchema.safeParse(id)
  const parsedData = updateProductSchema.safeParse(data)
  if (!parsedId.success || !parsedData.success) {
    return { success: false, error: 'Dados invalidos para atualizar o produto.' }
  }

  const { name, price, stock, active } = parsedData.data

  try {
    await prisma.product.update({
      where: { id: parsedId.data },
      data: {
        name,
        price: price ? new Decimal(price) : undefined,
        stock,
        active,
      },
    })

    revalidatePath('/products')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao atualizar produto.' }
  }
}

export async function adjustStock(id: string, newStock: number) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Apenas administradores podem ajustar o estoque manualmente.')
  }

  const parsedId = productIdSchema.safeParse(id)
  const parsedStock = z.number().int().nonnegative().safeParse(newStock)
  if (!parsedId.success || !parsedStock.success) {
    throw new Error('Dados invalidos para ajuste de estoque.')
  }

  await prisma.product.update({
    where: { id: parsedId.data },
    data: { stock: parsedStock.data },
  })

  revalidatePath('/products')
  return { success: true }
}

export async function deleteProduct(id: string) {
  const session = await getSession()
  if (!session) {
    throw new Error('Nao autorizado')
  }

  const parsedId = productIdSchema.safeParse(id)
  if (!parsedId.success) {
    return { success: false, error: 'Identificador de produto invalido.' }
  }

  try {
    await prisma.$transaction([
      prisma.entry.deleteMany({
        where: { productId: parsedId.data },
      }),
      prisma.product.delete({
        where: { id: parsedId.data },
      }),
    ])

    revalidatePath('/products')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao excluir produto.' }
  }
}
