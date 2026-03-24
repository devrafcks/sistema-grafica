import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('admin123456', 10)
  const employeePassword = await bcrypt.hash('123456', 10)

  // Create Admin
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      name: 'Administrador de Teste',
      code: 'ADM001',
      role: 'ADMIN',
      active: true,
    },
  })

  // Create Employee
  await prisma.user.upsert({
    where: { username: 'teste' },
    update: {},
    create: {
      username: 'teste',
      password: employeePassword,
      name: 'Funcionário de Teste',
      code: 'EMP001',
      role: 'EMPLOYEE',
      active: true,
    },
  })

  console.log('Seed executed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
