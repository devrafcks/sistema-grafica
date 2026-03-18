'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createEntry(data: {
  productId: string
  qty: string
  unitPrice: string
  note?: string
}) {
  try {
    const session = await getSession()
    if (!session) return { success: false, error: 'Não autenticado' }

    const product = await prisma.product.findUnique({
      where: { id: data.productId }
    })

    if (!product) return { success: false, error: 'Produto não encontrado' }

    const qty = Number(data.qty)
    const unitPrice = Number(data.unitPrice)
    const total = qty * unitPrice

    if (product.stock < qty) {
      return { success: false, error: `Estoque insuficiente. Disponível: ${product.stock}` }
    }

    const entry = await prisma.$transaction([
      prisma.entry.create({
        data: {
          userId: session.sub,
          productId: data.productId,
          productName: product.name,
          unitPrice,
          qty,
          total,
          note: data.note,
          priceEdited: unitPrice !== Number(product.price),
          date: new Date(),
        }
      }),
      prisma.product.update({
        where: { id: data.productId },
        data: {
          stock: {
            decrement: qty
          }
        }
      })
    ])

    revalidatePath('/dashboard')
    revalidatePath('/admin')
    revalidatePath('/products')
    
    return JSON.parse(JSON.stringify({ 
      success: true, 
      data: {
        ...entry[0],
        unitPrice: Number(entry[0].unitPrice),
        total: Number(entry[0].total)
      } 
    }))
  } catch (error: any) {
    console.error('Error creating entry:', error)
    return { success: false, error: 'Erro ao registrar serviço' }
  }
}

export async function getDashboardStats() {
  try {
    const session = await getSession()
    if (!session) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const entries = await prisma.entry.findMany({
      where: {
        userId: session.sub,
        date: {
          gte: today
        }
      }
    })

    const totalRevenue = entries.reduce((acc: number, entry: any) => acc + Number(entry.total), 0)
    const totalEntries = entries.length
    
    const productCounts: Record<string, number> = {}
    entries.forEach((entry: any) => {
      productCounts[entry.productName] = (productCounts[entry.productName] || 0) + 1
    })
    
    const topService = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '---'

    return JSON.parse(JSON.stringify({
      totalRevenue,
      totalEntries,
      topService
    }))
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
      include: {
        product: true
      }
    })

    return JSON.parse(JSON.stringify(
      entries.map((e: any) => ({
        ...e,
        unitPrice: Number(e.unitPrice),
        total: Number(e.total),
        product: e.product ? {
          ...e.product,
          price: Number(e.product.price)
        } : null
      }))
    ))
  } catch (error) {
    console.error('Error fetching recent entries:', error)
    return []
  }
}
