import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const query = searchParams.get('q')

    if (!code && !query) {
      return NextResponse.json({ error: 'Parâmetro de busca não fornecido' }, { status: 400 })
    }

    if (code) {
      const product = await prisma.product.findFirst({
        where: { code, active: true },
        select: {
          id: true,
          code: true,
          name: true,
          price: true,
          stock: true,
          active: true,
        }
      })

      if (!product) return NextResponse.json({ product: null })

      return NextResponse.json({
        product: {
          ...product,
          price: Number(product.price)
        }
      }, { headers: { 'Cache-Control': 'private, max-age=30' } })
    }

    const normalizedQuery = query?.trim() ?? ''
    if (normalizedQuery.length < 2) {
      return NextResponse.json({ products: [] }, { headers: { 'Cache-Control': 'private, max-age=15' } })
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: normalizedQuery, mode: 'insensitive' } },
          { code: { contains: normalizedQuery, mode: 'insensitive' } }
        ],
        active: true
      },
      select: {
        id: true,
        code: true,
        name: true,
        price: true,
        stock: true,
        active: true,
      },
      take: 10,
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      products: products.map((product) => ({
        ...product,
        price: Number(product.price)
      }))
    }, { headers: { 'Cache-Control': 'private, max-age=30' } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

