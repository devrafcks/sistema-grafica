import * as jose from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export interface UserSession {
  sub: string
  role: 'ADMIN' | 'EMPLOYEE'
  code: string
  name?: string
}

export async function verifySession(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jose.jwtVerify(token, secret)
    return payload as unknown as UserSession
  } catch (error) {
    return null
  }
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return null

  return verifySession(token)
}
