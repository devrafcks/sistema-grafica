import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed...')

  // Limpeza
  await prisma.entry.deleteMany({})
  await prisma.session.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.product.deleteMany({})

  const hashedPassword6 = await bcrypt.hash('123456', 10)
  const hashedAdminPassword = await bcrypt.hash('admin123', 10)

  // --- USUÁRIOS ---
  console.log('Criando usuários...')
  
  // 2 Admins
  const admins = [
    { name: 'Admin Principal', code: 'ADM-001', username: 'admin1', role: 'ADMIN' },
    { name: 'Gerente Operacional', code: 'ADM-002', username: 'admin2', role: 'ADMIN' },
  ]

  for (const adm of admins) {
    await prisma.user.upsert({
      where: { username: adm.username },
      update: {},
      create: { ...adm, password: hashedAdminPassword },
    })
  }

  // 8 Funcionários
  const employees = [
    { name: 'João Silva', code: 'FUN-001', username: 'joao.silva' },
    { name: 'Maria Santos', code: 'FUN-002', username: 'maria.santos' },
    { name: 'Pedro Oliveira', code: 'FUN-003', username: 'pedro.oliveira' },
    { name: 'Ana Costa', code: 'FUN-004', username: 'ana.costa' },
    { name: 'Lucas Pereira', code: 'FUN-005', username: 'lucas.pereira' },
    { name: 'Carla Souza', code: 'FUN-006', username: 'carla.souza' },
    { name: 'Roberto Lima', code: 'FUN-007', username: 'roberto.lima' },
    { name: 'Juliana Ferreira', code: 'FUN-008', username: 'juliana.ferreira' },
  ]

  for (const emp of employees) {
    await prisma.user.upsert({
      where: { username: emp.username },
      update: {},
      create: { ...emp, password: hashedPassword6, role: 'EMPLOYEE' },
    })
  }

  // --- PRODUTOS (50 Unidades) ---
  console.log('Criando produtos...')
  const productData = [
    { code: 'IMP-PB-S', name: 'Impressão P&B Simples', price: 0.25, stock: 1000 },
    { code: 'IMP-PB-F', name: 'Impressão P&B Frente e Verso', price: 0.45, stock: 1000 },
    { code: 'IMP-COR-S', name: 'Impressão Colorida Simples', price: 1.50, stock: 500 },
    { code: 'IMP-COR-F', name: 'Impressão Colorida Frente e Verso', price: 2.80, stock: 500 },
    { code: 'COP-A4-PB', name: 'Cópia A4 P&B', price: 0.20, stock: 2000 },
    { code: 'COP-A4-COR', name: 'Cópia A4 Colorida', price: 1.20, stock: 800 },
    { code: 'COP-A3-PB', name: 'Cópia A3 P&B', price: 0.50, stock: 400 },
    { code: 'COP-A3-COR', name: 'Cópia A3 Colorida', price: 2.50, stock: 200 },
    { code: 'PLAST-RG', name: 'Plastificação RG', price: 2.50, stock: 150 },
    { code: 'PLAST-A4', name: 'Plastificação A4', price: 4.00, stock: 200 },
    { code: 'PLAST-A3', name: 'Plastificação A3', price: 7.00, stock: 100 },
    { code: 'ENC-ESP-09', name: 'Encadernação Espiral 09mm', price: 5.00, stock: 100 },
    { code: 'ENC-ESP-12', name: 'Encadernação Espiral 12mm', price: 6.50, stock: 100 },
    { code: 'ENC-ESP-17', name: 'Encadernação Espiral 17mm', price: 8.00, stock: 100 },
    { code: 'ENC-ESP-23', name: 'Encadernação Espiral 23mm', price: 10.00, stock: 80 },
    { code: 'ENC-ESP-33', name: 'Encadernação Espiral 33mm', price: 15.00, stock: 50 },
    { code: 'CAN-AZU', name: 'Caneta Bic Azul', price: 2.00, stock: 150 },
    { code: 'CAN-PRE', name: 'Caneta Bic Preta', price: 2.00, stock: 120 },
    { code: 'CAN-VER', name: 'Caneta Bic Vermelha', price: 2.00, stock: 80 },
    { code: 'LAP-GRA', name: 'Lápis Grafite HB', price: 1.50, stock: 200 },
    { code: 'BOR-BRA', name: 'Borracha Branca M', price: 1.00, stock: 100 },
    { code: 'APO-SIM', name: 'Apontador Simples', price: 1.50, stock: 90 },
    { code: 'REG-30CM', name: 'Régua 30cm Acrílico', price: 3.50, stock: 60 },
    { code: 'GRA-26/6', name: 'Grampo para Grampeador 26/6 (caixa)', price: 8.90, stock: 40 },
    { code: 'CLI-GAL', name: 'Clips Galvanizado nº 2/0 (caixa)', price: 4.50, stock: 50 },
    { code: 'ENV-A4-B', name: 'Envelope A4 Branco', price: 0.50, stock: 500 },
    { code: 'ENV-PAR-O', name: 'Envelope Pardo Ofício', price: 0.40, stock: 500 },
    { code: 'FOL-A4-RE', name: 'Folha A4 Avulsa (Report)', price: 0.10, stock: 5000 },
    { code: 'BLOC-NOT', name: 'Bloco de Notas Autoadesivo 76x76', price: 5.90, stock: 70 },
    { code: 'CAD-UNI-96', name: 'Caderno Universitário 96 fls', price: 12.50, stock: 40 },
    { code: 'COR-LIQ', name: 'Corretivo Líquido', price: 4.50, stock: 30 },
    { code: 'FITA-ADE', name: 'Fita Adesiva Transparente', price: 3.20, stock: 55 },
    { code: 'COLA-BAST', name: 'Cola em Bastão 20g', price: 6.80, stock: 45 },
    { code: 'DIG-DOC-A4', name: 'Digitalização de Documento A4', price: 1.00, stock: 9999 },
    { code: 'ENV-EMAIL', name: 'Envio de E-mail / Documento', price: 2.00, stock: 9999 },
    { code: 'BOLETO-VIA', name: 'Emissão de 2ª via de Boleto', price: 3.00, stock: 9999 },
    { code: 'FOTO-3X4', name: 'Foto 3x4 (Pack com 4)', price: 15.00, stock: 200 },
    { code: 'CRACHA-CO', name: 'Crachá de Identificação cordão', price: 12.00, stock: 30 },
    { code: 'TES-ESCO', name: 'Tesoura Escolar', price: 5.50, stock: 25 },
    { code: 'MARC-TEX', name: 'Marca Texto Amarelo', price: 3.50, stock: 90 },
    { code: 'ESTO-PON', name: 'Estojo Porta Lápis', price: 9.90, stock: 15 },
    { code: 'PAST-CAT', name: 'Pasta Catálogo 50 plásticos', price: 25.00, stock: 20 },
    { code: 'PAST-SUS', name: 'Pasta Suspensa Haste Plástica', price: 4.20, stock: 60 },
    { code: 'ETI-PIM-60', name: 'Etiqueta Pimaco A4 (folha)', price: 2.50, stock: 100 },
    { code: 'CD-R-AVU', name: 'CD-R Avulso gravável', price: 3.00, stock: 40 },
    { code: 'DVD-R-AVU', name: 'DVD-R Avulso gravável', price: 4.50, stock: 40 },
    { code: 'PIL-ALCA', name: 'Pilha Alcalina AA (par)', price: 14.00, stock: 35 },
    { code: 'PIL-ALCA-AAA', name: 'Pilha Alcalina AAA (par)', price: 14.00, stock: 30 },
    { code: 'CART-PRE', name: 'Cartolina de cores variadas', price: 0.80, stock: 100 },
    { code: 'PAP-FOTO-A4', name: 'Papel Fotográfico A4 180g (folha)', price: 2.50, stock: 200 },
    { code: 'PAP-CANS-A4', name: 'Papel Canson A4 (folha)', price: 1.00, stock: 150 },
  ]

  for (const product of productData) {
    await prisma.product.upsert({
      where: { code: product.code },
      update: {
        name: product.name,
        price: product.price,
        stock: product.stock,
      },
      create: product,
    })
  }

  // --- MOVIMENTAÇÕES (ENTRIES) ---
  console.log('Criando movimentações...')
  const allUsers = await prisma.user.findMany()
  const allProducts = await prisma.product.findMany()

  const entriesToCreate = []
  const now = new Date()

  // Gerar ~200 movimentações nos últimos 30 dias
  for (let i = 0; i < 200; i++) {
    const user = allUsers[Math.floor(Math.random() * allUsers.length)]
    const product = allProducts[Math.floor(Math.random() * allProducts.length)]
    const qty = Math.floor(Math.random() * 5) + 1
    const price = Number(product.price)
    const total = qty * price
    
    // Data aleatória nos últimos 30 dias
    const daysAgo = Math.floor(Math.random() * 30)
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)
    date.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60)) // Horário comercial

    entriesToCreate.push({
      userId: user.id,
      productId: product.id,
      productName: product.name,
      unitPrice: price,
      qty: qty,
      total: total,
      date: date,
      note: Math.random() > 0.8 ? 'Observação de teste' : null,
    })
  }

  // Inserir em lotes para performance
  await prisma.entry.createMany({
    data: entriesToCreate,
  })

  console.log('Seed finalizada com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
