'use server'

import { revalidatePath } from 'next/cache'
import * as bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function createEmployee(data: any) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Não autorizado')
  }

  const { name, code, username, password, role } = data

  // Hash password
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
    return JSON.parse(JSON.stringify({ success: true, employee }))
  } catch (error: any) {
    if (error.code === 'P2002') {
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

  const employees = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return JSON.parse(JSON.stringify(employees))
}

export async function toggleEmployeeStatus(id: string, active: boolean) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Não autorizado')
  }

  await prisma.user.update({
    where: { id },
    data: { active },
  })

  revalidatePath('/admin/employees')
  revalidatePath('/admin')
  return { success: true }
}

export async function updateEmployee(id: string, data: any) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Não autorizado')
  }

  const { name, code, username, password, role } = data
  
  const updateData: any = {
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
      where: { id },
      data: updateData,
    })
    revalidatePath('/admin/employees')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: 'Erro ao atualizar funcionário.' }
  }
}
export async function deleteEmployee(id: string) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Não autorizado')
  }

  try {
    // Check if there are entries before deleting
    const entriesCount = await prisma.entry.count({
      where: { userId: id }
    })

    if (entriesCount > 0) {
      return { success: false, error: 'Não é possível excluir um funcionário que possui lançamentos vinculados. Desative-o em vez disso.' }
    }

    await prisma.user.delete({
      where: { id },
    })
    revalidatePath('/admin/employees')
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Erro ao excluir funcionário.' }
  }
}
