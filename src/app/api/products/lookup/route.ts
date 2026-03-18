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
        where: { code, active: true }
      })

      if (!product) return NextResponse.json({ product: null })

      return NextResponse.json({
        product: {
          ...product,
          price: Number(product.price)
        }
      })
    }

    // Search by query (code or name) for suggestions
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query!, mode: 'insensitive' } },
          { code: { contains: query!, mode: 'insensitive' } }
        ],
        active: true
      },
      take: 10,
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      products: products.map((p: any) => ({
        ...p,
        price: Number(p.price)
      }))
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
