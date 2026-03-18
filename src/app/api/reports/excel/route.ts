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
      'Produto/Serviço': item.name,
      'Quantidade': item.qty,
      'Total (R$)': item.total
    })))
    XLSX.utils.book_append_sheet(wb, wsStock, 'Estoque')
    const wsTeam = XLSX.utils.json_to_sheet(data.employeePerformance.map((e: any) => ({
      'Nome': e.name,
      'Código': e.code,
      'Lançamentos': e.count,
      'Total (R$)': e.total
    })))
    XLSX.utils.book_append_sheet(wb, wsTeam, 'Equipe')
    const wsDetails = XLSX.utils.json_to_sheet(data.entries.map((entry: any) => ({
      'Data/Hora': new Date(entry.createdAt).toLocaleString('pt-BR'),
      'Funcionário': entry.user.name,
      'Código Func.': entry.user.code,
      'Produto/Serviço': entry.productName,
      'Qtde': entry.qty,
      'Preço unit.': entry.unitPrice,
      'Total': entry.total,
      'Observação': entry.note || ''
    })))
    XLSX.utils.book_append_sheet(wb, wsDetails, 'Detalhes')

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    const timestamp = new Date().getTime()
    const reportFileName = `Relatório_Xerox_${timestamp}.xlsx`

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="Xerox_Report_${timestamp}.xlsx"; filename*=UTF-8''${encodeURIComponent(reportFileName)}`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

