'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { startOfDay, endOfDay } from 'date-fns'

export async function getReportData(filters: { from?: Date, to?: Date, userId?: string }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Não autorizado')
  }

  const { from, to, userId } = filters
  const dateFilter: any = {}
  
  if (from) dateFilter.gte = startOfDay(from)
  if (to) dateFilter.lte = endOfDay(to)

  const where: any = {
    date: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
    userId: userId !== 'all' ? userId : undefined
  }
  const entries = await prisma.entry.findMany({
    where,
    include: {
      user: {
        select: { name: true, code: true }
      }
    },
    orderBy: { date: 'desc' }
  })
  const employeePerformance: any = {}
  entries.forEach((entry: any) => {
    if (!employeePerformance[entry.userId]) {
      employeePerformance[entry.userId] = {
        id: entry.userId,
        name: entry.user.name,
        code: entry.user.code,
        count: 0,
        total: 0
      }
    }
    employeePerformance[entry.userId].count += 1
    employeePerformance[entry.userId].total += Number(entry.total)
  })
  const stockConsumption: any = {}
  entries.forEach((entry: any) => {
    if (!stockConsumption[entry.productName]) {
      stockConsumption[entry.productName] = {
        name: entry.productName,
        qty: 0,
        total: 0
      }
    }
    stockConsumption[entry.productName].qty += entry.qty
    stockConsumption[entry.productName].total += Number(entry.total)
  })

  return JSON.parse(JSON.stringify({
    employeePerformance: Object.values(employeePerformance),
    stockConsumption: Object.values(stockConsumption),
    totalRevenue: Object.values(employeePerformance).reduce((acc: number, curr: any) => acc + curr.total, 0),
    totalEntries: entries.length,
    entries
  }))
}

