import * as jose from 'jose'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { prisma } from '@/lib/prisma'

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) throw new Error('JWT_SECRET não configurado nas variáveis de ambiente.')
const secret = new TextEncoder().encode(jwtSecret)

export interface UserSession {
  sub: string
  role: 'ADMIN' | 'EMPLOYEE'
  code: string
  name?: string
}

export const verifySession = cache(async (token: string): Promise<UserSession | null> => {
  try {
    await jose.jwtVerify(token, secret)
    const session = await prisma.session.findUnique({
      where: { token },
      select: {
        user: {
          select: {
            id: true,
            role: true,
            code: true,
            name: true,
            active: true,
          },
        },
        expiresAt: true,
      },
    })

    if (!session || !session.user.active || session.expiresAt <= new Date()) {
      return null
    }

    return {
      sub: session.user.id,
      role: session.user.role,
      code: session.user.code,
      name: session.user.name,
    }
  } catch {
    return null
  }
})

export const getSession = cache(async (): Promise<UserSession | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return null

  return verifySession(token)
})
