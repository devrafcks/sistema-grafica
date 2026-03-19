'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { startOfDay, endOfDay } from 'date-fns'
import { z } from 'zod'

const MAX_RANGE_DAYS = 366

const reportFiltersSchema = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
  userId: z.union([z.literal('all'), z.string().uuid()]).optional(),
}).refine(
  (data) => {
    if (data.from && data.to && data.from > data.to) return false
    if (data.from && data.to) {
      const diffDays = (data.to.getTime() - data.from.getTime()) / (1000 * 60 * 60 * 24)
      if (diffDays > MAX_RANGE_DAYS) return false
    }
    return true
  },
  { message: 'Intervalo de datas inválido.' }
)

export async function getReportData(filters: { from?: Date, to?: Date, userId?: string }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Não autorizado')
  }

  const parsed = reportFiltersSchema.safeParse(filters)
  if (!parsed.success) {
    throw new Error('Filtros inválidos.')
  }

  const { from, to, userId } = parsed.data
  const dateFilter: Partial<{ gte: Date; lte: Date }> = {}

  if (from) dateFilter.gte = startOfDay(from)
  if (to) dateFilter.lte = endOfDay(to)

  const where = {
    date: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
    userId: userId && userId !== 'all' ? userId : undefined,
  }
  const [entries, employeeGroups, stockGroups, totals] = await Promise.all([
    prisma.entry.findMany({
      where,
      select: {
        id: true,
        userId: true,
        productName: true,
        qty: true,
        total: true,
        createdAt: true,
        note: true,
        unitPrice: true,
        user: {
          select: { name: true, code: true }
        }
      },
      orderBy: { date: 'desc' }
    }),
    prisma.entry.groupBy({
      by: ['userId'],
      where,
      _count: { id: true },
      _sum: { total: true }
    }),
    prisma.entry.groupBy({
      by: ['productName'],
      where,
      _sum: { qty: true, total: true }
    }),
    prisma.entry.aggregate({
      where,
      _count: { id: true },
      _sum: { total: true }
    }),
  ])

  const firstUserIndex = new Map<string, number>()
  const firstProductIndex = new Map<string, number>()
  const userDetails = new Map<string, { name: string; code: string }>()

  entries.forEach((entry, index) => {
    if (!firstUserIndex.has(entry.userId)) {
      firstUserIndex.set(entry.userId, index)
      userDetails.set(entry.userId, {
        name: entry.user.name,
        code: entry.user.code,
      })
    }

    if (!firstProductIndex.has(entry.productName)) {
      firstProductIndex.set(entry.productName, index)
    }
  })

  const employeePerformance = employeeGroups
    .map((group) => {
      const user = userDetails.get(group.userId)

      return {
        id: group.userId,
        name: user?.name ?? '',
        code: user?.code ?? '',
        count: group._count.id,
        total: Number(group._sum.total ?? 0),
      }
    })
    .sort((left, right) => (firstUserIndex.get(left.id) ?? Number.MAX_SAFE_INTEGER) - (firstUserIndex.get(right.id) ?? Number.MAX_SAFE_INTEGER))

  const stockConsumption = stockGroups
    .map((group) => ({
      name: group.productName,
      qty: group._sum.qty ?? 0,
      total: Number(group._sum.total ?? 0),
    }))
    .sort((left, right) => (firstProductIndex.get(left.name) ?? Number.MAX_SAFE_INTEGER) - (firstProductIndex.get(right.name) ?? Number.MAX_SAFE_INTEGER))

  const normalizedEntries = entries.map((entry) => ({
    ...entry,
    total: Number(entry.total),
    unitPrice: Number(entry.unitPrice),
  }))

  return JSON.parse(JSON.stringify({
    employeePerformance,
    stockConsumption,
    totalRevenue: Number(totals._sum.total ?? 0),
    totalEntries: totals._count.id,
    entries: normalizedEntries
  }))
}

