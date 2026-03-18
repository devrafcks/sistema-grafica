'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { Decimal } from '@prisma/client/runtime/library'
import { z } from 'zod'

const createEntrySchema = z.object({
  productId: z.string().min(1),
  qty: z.coerce.number().int().positive(),
  unitPrice: z.coerce.number().positive(),
  note: z.string().max(300).optional(),
})

export async function createEntry(data: {
  productId: string
  qty: string
  unitPrice: string
  note?: string
}) {
  try {
    const session = await getSession()
    if (!session) return { success: false, error: 'Não autenticado' }

    const parsed = createEntrySchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: 'Dados inválidos para o lançamento' }
    }

    const { productId, qty, unitPrice, note } = parsed.data
    const total = qty * unitPrice

    const entry = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, price: true, stock: true, active: true },
      })

      if (!product || !product.active) {
        throw new Error('PRODUCT_NOT_FOUND')
      }

      const updated = await tx.product.updateMany({
        where: {
          id: productId,
          stock: { gte: qty },
        },
        data: {
          stock: { decrement: qty },
        },
      })

      if (updated.count === 0) {
        throw new Error('INSUFFICIENT_STOCK')
      }

      return tx.entry.create({
        data: {
          userId: session.sub,
          productId,
          productName: product.name,
          unitPrice: new Decimal(unitPrice),
          qty,
          total: new Decimal(total),
          note,
          priceEdited: unitPrice !== Number(product.price),
          date: new Date(),
        },
      })
    })

    revalidatePath('/dashboard')
    revalidatePath('/admin')
    revalidatePath('/products')

    return {
      success: true,
      data: {
        ...entry,
        unitPrice: Number(entry.unitPrice),
        total: Number(entry.total)
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'INSUFFICIENT_STOCK') {
      return { success: false, error: 'Estoque insuficiente para o lançamento' }
    }
    if (error instanceof Error && error.message === 'PRODUCT_NOT_FOUND') {
      return { success: false, error: 'Produto não encontrado ou inativo' }
    }
    return { success: false, error: 'Erro ao registrar serviço' }
  }
}

export async function getDashboardStats() {
  try {
    const session = await getSession()
    if (!session) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [stats, topService] = await Promise.all([
      prisma.entry.aggregate({
        where: {
          userId: session.sub,
          date: {
            gte: today
          }
        },
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.entry.groupBy({
        by: ['productName'],
        where: {
          userId: session.sub,
          date: {
            gte: today
          }
        },
        _count: { productName: true },
        orderBy: {
          _count: {
            productName: 'desc'
          }
        },
        take: 1,
      }),
    ])

    return {
      totalRevenue: Number(stats._sum.total || 0),
      totalEntries: stats._count.id || 0,
      topService: topService[0]?.productName || '---'
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return null
  }
}

export async function getRecentEntries(limit = 10) {
  try {
    const session = await getSession()
    if (!session) return []

    const entries = await prisma.entry.findMany({
      where: {
        userId: session.sub
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      select: {
        id: true,
        productName: true,
        note: true,
        qty: true,
        total: true,
        createdAt: true,
      }
    })

    return entries.map((entry) => ({
      ...entry,
      total: Number(entry.total),
    }))
  } catch (error) {
    console.error('Error fetching recent entries:', error)
    return []
  }
}

