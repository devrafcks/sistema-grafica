import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const employeePassword = await bcrypt.hash('123456', 12)

  // Criar ADMIN
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      name: 'Administrador',
      code: 'ADM-001',
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // Criar Employee 1
  await prisma.user.upsert({
    where: { username: 'joao.silva' },
    update: {},
    create: {
      name: 'João Silva',
      code: '001',
      username: 'joao.silva',
      password: employeePassword,
      role: 'EMPLOYEE',
    },
  })

  // Criar Employee 2
  await prisma.user.upsert({
    where: { username: 'maria.souza' },
    update: {},
    create: {
      name: 'Maria Souza',
      code: '002',
      username: 'maria.souza',
      password: employeePassword,
      role: 'EMPLOYEE',
    },
  })

  // Produtos
  const products = [
    { code: 'IMP-PB', name: 'Impressão P&B', price: 0.25, stock: 500 },
    { code: 'IMP-COR', name: 'Impressão Colorida', price: 1.00, stock: 200 },
    { code: 'PLAST-A4', name: 'Plastificação A4', price: 3.50, stock: 100 },
    { code: 'PLAST-A3', name: 'Plastificação A3', price: 5.00, stock: 80 },
    { code: 'ENC-ESP', name: 'Encadernação Espiral', price: 8.00, stock: 60 },
    { code: 'XEROX-A4', name: 'Cópia Simples A4', price: 0.20, stock: 1000 },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { code: product.code },
      update: {},
      create: product,
    })
  }

  console.log('Seed executed successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
