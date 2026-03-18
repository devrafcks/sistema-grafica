import { NextRequest, NextResponse } from 'next/server'
import { getReportData } from '@/lib/actions/report.actions'
import * as XLSX from 'xlsx'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined
    const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined
    const userId = searchParams.get('userId') || 'all'

    const data = await getReportData({ from, to, userId })

    const wb = XLSX.utils.book_new()
    const wsStock = XLSX.utils.json_to_sheet(data.stockConsumption.map((item: any) => ({
      'Produto/Servio': item.name,
      'Quantidade': item.qty,
      'Total (R$)': item.total
    })))
    XLSX.utils.book_append_sheet(wb, wsStock, 'Estoque')
    const wsTeam = XLSX.utils.json_to_sheet(data.employeePerformance.map((e: any) => ({
      'Nome': e.name,
      'Cdigo': e.code,
      'Lanamentos': e.count,
      'Total (R$)': e.total
    })))
    XLSX.utils.book_append_sheet(wb, wsTeam, 'Equipe')
    const wsDetails = XLSX.utils.json_to_sheet(data.entries.map((entry: any) => ({
      'Data/Hora': new Date(entry.createdAt).toLocaleString('pt-BR'),
      'Funcionrio': entry.user.name,
      'Cdigo Func.': entry.user.code,
      'Produto/Servio': entry.productName,
      'Qtde': entry.qty,
      'Preo Unit.': entry.unitPrice,
      'Total': entry.total,
      'Observao': entry.note || ''
    })))
    XLSX.utils.book_append_sheet(wb, wsDetails, 'Detalhes')

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="Relatorio_Xerox_${new Date().getTime()}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

