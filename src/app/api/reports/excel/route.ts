import { NextRequest, NextResponse } from 'next/server'
import { getReportData } from '@/lib/actions/report.actions'
import * as XLSX from 'xlsx'

const S = {
  titleBg: {
    font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb: '1D4ED8' }, bgColor: { indexed: 64 } },
    alignment: { horizontal: 'left', vertical: 'center', wrapText: false },
  },
  titleBgEmpty: {
    fill: { patternType: 'solid', fgColor: { rgb: '1D4ED8' }, bgColor: { indexed: 64 } },
  },
  subtitleBg: {
    font: { sz: 9, color: { rgb: 'BFDBFE' } },
    fill: { patternType: 'solid', fgColor: { rgb: '1E3A8A' }, bgColor: { indexed: 64 } },
    alignment: { horizontal: 'left', vertical: 'center' },
  },
  subtitleBgEmpty: {
    fill: { patternType: 'solid', fgColor: { rgb: '1E3A8A' }, bgColor: { indexed: 64 } },
  },
  header: {
    font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb: '2563EB' }, bgColor: { indexed: 64 } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: '93C5FD' } },
      bottom: { style: 'thin', color: { rgb: '93C5FD' } },
      left: { style: 'thin', color: { rgb: '1D4ED8' } },
      right: { style: 'thin', color: { rgb: '1D4ED8' } },
    },
  },
  headerLeft: {
    font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb: '2563EB' }, bgColor: { indexed: 64 } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: '93C5FD' } },
      bottom: { style: 'thin', color: { rgb: '93C5FD' } },
      left: { style: 'thin', color: { rgb: '1D4ED8' } },
      right: { style: 'thin', color: { rgb: '1D4ED8' } },
    },
  },
  rowEven: {
    font: { sz: 10, color: { rgb: '1E293B' } },
    fill: { patternType: 'solid', fgColor: { rgb: 'FFFFFF' }, bgColor: { indexed: 64 } },
    alignment: { vertical: 'center' },
    border: { bottom: { style: 'thin', color: { rgb: 'E2E8F0' } } },
  },
  rowOdd: {
    font: { sz: 10, color: { rgb: '1E293B' } },
    fill: { patternType: 'solid', fgColor: { rgb: 'F1F5F9' }, bgColor: { indexed: 64 } },
    alignment: { vertical: 'center' },
    border: { bottom: { style: 'thin', color: { rgb: 'E2E8F0' } } },
  },
  rowEvenNum: {
    font: { bold: true, sz: 10, color: { rgb: '166534' } },
    fill: { patternType: 'solid', fgColor: { rgb: 'FFFFFF' }, bgColor: { indexed: 64 } },
    alignment: { horizontal: 'right', vertical: 'center' },
    border: { bottom: { style: 'thin', color: { rgb: 'E2E8F0' } } },
    numFmt: '#,##0.00',
  },
  rowOddNum: {
    font: { bold: true, sz: 10, color: { rgb: '166534' } },
    fill: { patternType: 'solid', fgColor: { rgb: 'F1F5F9' }, bgColor: { indexed: 64 } },
    alignment: { horizontal: 'right', vertical: 'center' },
    border: { bottom: { style: 'thin', color: { rgb: 'E2E8F0' } } },
    numFmt: '#,##0.00',
  },
  rowCenter: (odd: boolean) => ({
    font: { sz: 10, color: { rgb: '475569' } },
    fill: { patternType: 'solid', fgColor: { rgb: odd ? 'F1F5F9' : 'FFFFFF' }, bgColor: { indexed: 64 } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: { bottom: { style: 'thin', color: { rgb: 'E2E8F0' } } },
  }),
  total: {
    font: { bold: true, sz: 11, color: { rgb: '1D4ED8' } },
    fill: { patternType: 'solid', fgColor: { rgb: 'DBEAFE' }, bgColor: { indexed: 64 } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: { top: { style: 'medium', color: { rgb: '1D4ED8' } }, bottom: { style: 'thin', color: { rgb: '93C5FD' } } },
  },
  totalEmpty: {
    fill: { patternType: 'solid', fgColor: { rgb: 'DBEAFE' }, bgColor: { indexed: 64 } },
    border: { top: { style: 'medium', color: { rgb: '1D4ED8' } }, bottom: { style: 'thin', color: { rgb: '93C5FD' } } },
  },
  totalNum: {
    font: { bold: true, sz: 11, color: { rgb: '166534' } },
    fill: { patternType: 'solid', fgColor: { rgb: 'DBEAFE' }, bgColor: { indexed: 64 } },
    alignment: { horizontal: 'right', vertical: 'center' },
    border: { top: { style: 'medium', color: { rgb: '1D4ED8' } }, bottom: { style: 'thin', color: { rgb: '93C5FD' } } },
    numFmt: '#,##0.00',
  },
}

function setCell(ws: XLSX.WorkSheet, addr: string, v: any, t: XLSX.ExcelDataType, s: any) {
  ws[addr] = { v, t, s }
}

function encodeCol(c: number): string {
  let name = ''
  for (let n = c; n >= 0; n = Math.floor(n / 26) - 1) {
    name = String.fromCharCode((n % 26) + 65) + name
  }
  return name
}

function addr(r: number, c: number) {
  return `${encodeCol(c)}${r + 1}`
}

function buildDetailSheet(entries: any[], period: string): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {}
  const COLS = 8

  let r = 0

  setCell(ws, addr(r, 0), 'XEROX MANAGER — RELATÓRIO DETALHADO DE LANÇAMENTOS', 's', S.titleBg)
  for (let c = 1; c < COLS; c++) setCell(ws, addr(r, c), '', 's', S.titleBgEmpty)
  r++

  setCell(ws, addr(r, 0), `Período: ${period}   |   Gerado em: ${new Date().toLocaleString('pt-BR')}`, 's', S.subtitleBg)
  for (let c = 1; c < COLS; c++) setCell(ws, addr(r, c), '', 's', S.subtitleBgEmpty)
  r++

  r++

  const headers = ['Data / Hora', 'Funcionário', 'Código', 'Produto / Estoque', 'Qtde', 'Preço Unit.', 'Total (R$)', 'Observação']
  headers.forEach((h, c) => {
    setCell(ws, addr(r, c), h, 's', c === 0 || c === 1 || c === 3 || c === 7 ? S.headerLeft : S.header)
  })
  r++

  let totalGeral = 0
  entries.forEach((entry, i) => {
    const odd = i % 2 !== 0
    const base = odd ? S.rowOdd : S.rowEven
    const num = odd ? S.rowOddNum : S.rowEvenNum
    const cen = S.rowCenter(odd)
    const total = Number(entry.total)
    totalGeral += total

    setCell(ws, addr(r, 0), new Date(entry.createdAt).toLocaleString('pt-BR'), 's', base)
    setCell(ws, addr(r, 1), entry.user.name, 's', base)
    setCell(ws, addr(r, 2), entry.user.code, 's', cen)
    setCell(ws, addr(r, 3), entry.productName, 's', base)
    setCell(ws, addr(r, 4), entry.qty, 'n', cen)
    setCell(ws, addr(r, 5), Number(entry.unitPrice), 'n', num)
    setCell(ws, addr(r, 6), total, 'n', num)
    setCell(ws, addr(r, 7), entry.note || '', 's', base)
    r++
  })

  setCell(ws, addr(r, 0), 'TOTAL GERAL', 's', S.total)
  for (let c = 1; c < 6; c++) setCell(ws, addr(r, c), '', 's', S.totalEmpty)
  setCell(ws, addr(r, 6), totalGeral, 'n', S.totalNum)
  setCell(ws, addr(r, 7), '', 's', S.totalEmpty)

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r, c: COLS - 1 } })
  ws['!cols'] = [{ wch: 20 }, { wch: 22 }, { wch: 12 }, { wch: 28 }, { wch: 8 }, { wch: 14 }, { wch: 16 }, { wch: 28 }]
  ws['!rows'] = [{ hpt: 32 }, { hpt: 20 }, { hpt: 6 }, { hpt: 24 }]
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: COLS - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: COLS - 1 } },
    { s: { r: r, c: 0 }, e: { r: r, c: 5 } },
  ]

  return ws
}

function buildTeamSheet(performance: any[], period: string): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {}
  const COLS = 4

  let r = 0

  setCell(ws, addr(r, 0), 'XEROX MANAGER — DESEMPENHO DA EQUIPE', 's', S.titleBg)
  for (let c = 1; c < COLS; c++) setCell(ws, addr(r, c), '', 's', S.titleBgEmpty)
  r++

  setCell(ws, addr(r, 0), `Período: ${period}   |   Gerado em: ${new Date().toLocaleString('pt-BR')}`, 's', S.subtitleBg)
  for (let c = 1; c < COLS; c++) setCell(ws, addr(r, c), '', 's', S.subtitleBgEmpty)
  r++

  r++

  const headers = ['Funcionário', 'Código', 'Lançamentos', 'Total (R$)']
  headers.forEach((h, c) => {
    setCell(ws, addr(r, c), h, 's', c === 0 ? S.headerLeft : S.header)
  })
  r++

  let totalEquipe = 0
  performance.forEach((emp, i) => {
    const odd = i % 2 !== 0
    const base = odd ? S.rowOdd : S.rowEven
    const num = odd ? S.rowOddNum : S.rowEvenNum
    const cen = S.rowCenter(odd)
    const total = Number(emp.total)
    totalEquipe += total

    setCell(ws, addr(r, 0), emp.name, 's', base)
    setCell(ws, addr(r, 1), emp.code, 's', cen)
    setCell(ws, addr(r, 2), emp.count, 'n', cen)
    setCell(ws, addr(r, 3), total, 'n', num)
    r++
  })

  setCell(ws, addr(r, 0), 'TOTAL DA EQUIPE', 's', S.total)
  setCell(ws, addr(r, 1), '', 's', S.totalEmpty)
  setCell(ws, addr(r, 2), '', 's', S.totalEmpty)
  setCell(ws, addr(r, 3), totalEquipe, 'n', S.totalNum)

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r, c: COLS - 1 } })
  ws['!cols'] = [{ wch: 26 }, { wch: 14 }, { wch: 16 }, { wch: 18 }]
  ws['!rows'] = [{ hpt: 32 }, { hpt: 20 }, { hpt: 6 }, { hpt: 24 }]
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: COLS - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: COLS - 1 } },
    { s: { r: r, c: 0 }, e: { r: r, c: 2 } },
  ]

  return ws
}

function buildStockSheet(stock: any[], period: string): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {}
  const COLS = 3

  let r = 0

  setCell(ws, addr(r, 0), 'XEROX MANAGER — CONSUMO DE ESTOQUE / PRODUTOS', 's', S.titleBg)
  for (let c = 1; c < COLS; c++) setCell(ws, addr(r, c), '', 's', S.titleBgEmpty)
  r++

  setCell(ws, addr(r, 0), `Período: ${period}   |   Gerado em: ${new Date().toLocaleString('pt-BR')}`, 's', S.subtitleBg)
  for (let c = 1; c < COLS; c++) setCell(ws, addr(r, c), '', 's', S.subtitleBgEmpty)
  r++

  r++

  setCell(ws, addr(r, 0), 'Produto / Estoque', 's', S.headerLeft)
  setCell(ws, addr(r, 1), 'Quantidade', 's', S.header)
  setCell(ws, addr(r, 2), 'Total (R$)', 's', S.header)
  r++

  let totalEstoque = 0
  stock.forEach((item, i) => {
    const odd = i % 2 !== 0
    const base = odd ? S.rowOdd : S.rowEven
    const num = odd ? S.rowOddNum : S.rowEvenNum
    const cen = S.rowCenter(odd)
    const total = Number(item.total)
    totalEstoque += total

    setCell(ws, addr(r, 0), item.name, 's', base)
    setCell(ws, addr(r, 1), item.qty, 'n', cen)
    setCell(ws, addr(r, 2), total, 'n', num)
    r++
  })

  setCell(ws, addr(r, 0), 'TOTAL', 's', S.total)
  setCell(ws, addr(r, 1), '', 's', S.totalEmpty)
  setCell(ws, addr(r, 2), totalEstoque, 'n', S.totalNum)

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: r, c: COLS - 1 } })
  ws['!cols'] = [{ wch: 34 }, { wch: 16 }, { wch: 18 }]
  ws['!rows'] = [{ hpt: 32 }, { hpt: 20 }, { hpt: 6 }, { hpt: 24 }]
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: COLS - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: COLS - 1 } },
    { s: { r: r, c: 0 }, e: { r: r, c: 1 } },
  ]

  return ws
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined
    const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined
    const userId = searchParams.get('userId') || 'all'

    const data = await getReportData({ from, to, userId })

    const period = from && to
      ? `${from.toLocaleDateString('pt-BR')} a ${to.toLocaleDateString('pt-BR')}`
      : from
        ? `A partir de ${from.toLocaleDateString('pt-BR')}`
        : 'Período completo'

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, buildDetailSheet(data.entries, period), 'Lançamentos')
    XLSX.utils.book_append_sheet(wb, buildTeamSheet(data.employeePerformance, period), 'Equipe')
    XLSX.utils.book_append_sheet(wb, buildStockSheet(data.stockConsumption, period), 'Estoque')

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx', cellStyles: true })

    const timestamp = new Date().toISOString().slice(0, 10)
    const reportFileName = `Relatorio_Xerox_${timestamp}.xlsx`

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${reportFileName}"; filename*=UTF-8''${encodeURIComponent(reportFileName)}`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
  } catch (error) {
    console.error('[Excel Report]', error)
    return NextResponse.json({ error: 'Erro ao gerar relatório Excel.' }, { status: 500 })
  }
}
