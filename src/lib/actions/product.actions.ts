'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { Decimal } from '@prisma/client/runtime/library'

export async function createProduct(data: any) {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')

  const { code, name, price, stock } = data

  try {
    const product = await prisma.product.create({
      data: {
        code,
        name,
        price: new Decimal(price),
        stock: parseInt(stock) || 0,
        active: true,
      },
    })
    revalidatePath('/admin/products')
    revalidatePath('/dashboard')
    return JSON.parse(JSON.stringify({ 
      success: true, 
      product: {
        ...product,
        price: Number(product.price)
      } 
    }))
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: 'Código de produto já cadastrado.' }
    }
    return { success: false, error: 'Erro ao criar produto.' }
  }
}

export async function getProducts() {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')

  const products = await prisma.product.findMany({
    where: session.role === 'ADMIN' ? {} : { active: true },
    orderBy: { name: 'asc' },
  })

  return JSON.parse(JSON.stringify(
    products.map((p: any) => ({
      ...p,
      price: Number(p.price)
    }))
  ))
}

export async function updateProduct(id: string, data: any) {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')

  const { name, price, stock, active } = data

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name,
        price: price ? new Decimal(price) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        active,
      },
    })
    revalidatePath('/admin/products')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Erro ao atualizar produto.' }
  }
}

export async function adjustStock(id: string, newStock: number) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Apenas administradores podem ajustar o estoque manualmente.')
  }

  await prisma.product.update({
    where: { id },
    data: { stock: newStock },
  })

  revalidatePath('/admin/products')
  return { success: true }
}
export async function deleteProduct(id: string) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Não autorizado')
  }

  try {
    // Check if there are entries before deleting
    const entriesCount = await prisma.entry.count({
      where: { productId: id }
    })

    if (entriesCount > 0) {
      return { success: false, error: 'Não é possível excluir um produto que possui lançamentos vinculados. Desative-o em vez disso.' }
    }

    await prisma.product.delete({
      where: { id },
    })
    revalidatePath('/admin/products')
    revalidatePath('/products')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Erro ao excluir produto.' }
  }
}
