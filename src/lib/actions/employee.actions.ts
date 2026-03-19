'use server'

import { revalidatePath } from 'next/cache'
import * as bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const employeeIdSchema = z.string().min(1)
const createEmployeeSchema = z.object({
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().min(1).max(40),
  username: z.string().trim().min(3).max(50),
  password: z.string().min(6).max(120),
  role: z.enum(['ADMIN', 'EMPLOYEE']).optional(),
})
const updateEmployeeSchema = z.object({
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().min(1).max(40),
  username: z.string().trim().min(3).max(50),
  password: z.string().min(6).max(120).optional(),
  role: z.enum(['ADMIN', 'EMPLOYEE']).optional(),
})

export async function createEmployee(data: { name: string; code: string; username: string; password: string; role?: 'ADMIN' | 'EMPLOYEE' }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Não autorizado')
  }

  const parsed = createEmployeeSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: 'Dados inválidos do funcionário.' }
  }

  const { name, code, username, password, role } = parsed.data
  const hashedPassword = await bcrypt.hash(password, 12)

  try {
    const employee = await prisma.user.create({
      data: {
        name,
        code,
        username,
        password: hashedPassword,
        role: role || 'EMPLOYEE',
        active: true,
      },
    })

    revalidatePath('/admin/employees')
    return { success: true, employee }
  } catch (error: unknown) {
    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') {
      return { success: false, error: 'Usuário ou código já cadastrado.' }
    }

    return { success: false, error: 'Erro ao criar funcionário.' }
  }
}

export async function getEmployees() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Não autorizado')
  }

  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      username: true,
      role: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function toggleEmployeeStatus(id: string, active: boolean) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Não autorizado')
  }

  const parsedId = employeeIdSchema.safeParse(id)
  if (!parsedId.success) {
    throw new Error('Identificador inválido')
  }

  await prisma.user.update({
    where: { id: parsedId.data },
    data: { active },
  })

  revalidatePath('/admin/employees')
  revalidatePath('/admin')
  return { success: true }
}

export async function updateEmployee(
  id: string,
  data: { name: string; code: string; username: string; password?: string; role?: 'ADMIN' | 'EMPLOYEE' }
) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Não autorizado')
  }

  const parsedId = employeeIdSchema.safeParse(id)
  const parsedData = updateEmployeeSchema.safeParse(data)
  if (!parsedId.success || !parsedData.success) {
    return { success: false, error: 'Dados inválidos para atualizar o funcionário.' }
  }

  const { name, code, username, password, role } = parsedData.data
  const updateData: {
    name: string
    code: string
    username: string
    role?: 'ADMIN' | 'EMPLOYEE'
    password?: string
  } = {
    name,
    code,
    username,
    role,
  }

  if (password && password.trim().length >= 6) {
    updateData.password = await bcrypt.hash(password, 12)
  }

  try {
    await prisma.user.update({
      where: { id: parsedId.data },
      data: updateData,
    })

    revalidatePath('/admin/employees')
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao atualizar funcionário.' }
  }
}

export async function deleteEmployee(id: string) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Não autorizado')
  }

  const parsedId = employeeIdSchema.safeParse(id)
  if (!parsedId.success) {
    return { success: false, error: 'Identificador de funcionário inválido.' }
  }

  try {
    await prisma.$transaction([
      prisma.entry.deleteMany({
        where: { userId: parsedId.data },
      }),
      prisma.session.deleteMany({
        where: { userId: parsedId.data },
      }),
      prisma.user.delete({
        where: { id: parsedId.data },
      }),
    ])

    revalidatePath('/admin/employees')
    revalidatePath('/admin')
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao excluir funcionário.' }
  }
}
