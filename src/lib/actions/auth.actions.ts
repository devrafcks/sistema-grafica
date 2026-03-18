'use server'

import { cookies } from 'next/headers'
import * as bcrypt from 'bcryptjs'
import * as jose from 'jose'
import { prisma } from '@/lib/prisma'

export async function loginAction(formData: FormData) {
  if (!process.env.JWT_SECRET) {
    return { success: false, error: 'Configuração de autenticação inválida' }
  }

  const usernameInput = (formData.get('username') as string)?.trim() || ''
  const password = formData.get('password') as string

  if (!usernameInput || !password) {
    return { success: false, error: 'Credenciais inválidas' }
  }
  const user = await prisma.user.findFirst({
    where: { 
      username: { 
        equals: usernameInput, 
        mode: 'insensitive' 
      } 
    }
  })

  if (!user || !user.active) {
    return { success: false, error: 'Credenciais inválidas' }
  }
  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    return { success: false, error: 'Credenciais inválidas' }
  }
  const secret = new TextEncoder().encode(process.env.JWT_SECRET)
  const alg = 'HS256'

  const token = await new jose.SignJWT({
    sub: user.id,
    name: user.name,
    role: user.role,
    code: user.code
  })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await prisma.$transaction(async (tx) => {
    await tx.session.deleteMany({
      where: {
        OR: [
          { userId: user.id, expiresAt: { lt: new Date() } },
          { expiresAt: { lt: new Date() } },
        ],
      },
    })

    await tx.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    })
  })
  const cookieStore = await cookies()
  cookieStore.set({
    name: 'session',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  })

  return { success: true, user: { id: user.id, name: user.name, role: user.role, code: user.code } }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (token) {
    await prisma.session.deleteMany({
      where: { token }
    })
  }
  cookieStore.delete('session')

  return { success: true }
}


