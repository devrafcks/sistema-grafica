import { NextRequest, NextResponse } from 'next/server'
import { getReportData } from '@/lib/actions/report.actions'
import { ReactElement } from 'react'
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  renderToBuffer 
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: 'white' },
  header: { marginBottom: 30, borderBottomWidth: 2, borderBottomColor: '#6272e0', paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginBottom: 5 },
  subtitle: { fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  range: { fontSize: 12, color: '#3b82f6', fontWeight: 'bold', marginTop: 10 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 15, backgroundColor: '#F8FAFC', padding: 8, borderRadius: 4 },
  table: { width: 'auto', borderStyle: 'solid', borderWidth: 0, marginBottom: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#3B82F6', borderRadius: 4, marginBottom: 5 },
  tableHeaderCell: { flex: 1, padding: 8, color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  tableHeaderCellRight: { flex: 1, padding: 8, color: '#FFFFFF', fontSize: 10, fontWeight: 'bold', textAlign: 'right' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', minHeight: 30, alignItems: 'center' },
  cell: { flex: 1, padding: 8, fontSize: 10, color: '#334155' },
  cellBold: { flex: 1, padding: 8, fontSize: 10, color: '#0F172A', fontWeight: 'bold' },
  cellRight: { flex: 1, padding: 8, fontSize: 10, color: '#334155', textAlign: 'right' },
  cellRightBold: { flex: 1, padding: 8, fontSize: 10, color: '#3B82F6', fontWeight: 'bold', textAlign: 'right' },
  footer: { position: 'absolute', bottom: 40, left: 40, right: 40, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerText: { fontSize: 8, color: '#94A3B8' },
  summaryBox: { marginTop: 20, padding: 20, backgroundColor: '#F8FAFC', borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#3B82F6' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  summaryLabel: { fontSize: 10, color: '#64748B', fontWeight: 'bold' },
  summaryValue: { fontSize: 14, color: '#1E293B', fontWeight: 'black' }
})

const MyDocument = ({ data, range }: { data: any, range: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>Relatório gerencial</Text>
        <Text style={styles.title}>Xerox Manager</Text>
        <Text style={styles.range}>Período: {range}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consumo de Estoque</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderCell}>Produto / Serviço</Text>
          <Text style={styles.tableHeaderCellRight}>Quantidade</Text>
          <Text style={styles.tableHeaderCellRight}>Total (R$)</Text>
        </View>
        {data.stockConsumption.map((item: any, i: number) => (
          <View key={i} style={styles.row}>
            <Text style={styles.cellBold}>{item.name}</Text>
            <Text style={styles.cellRight}>{item.qty}</Text>
            <Text style={styles.cellRightBold}>{item.total.toFixed(2).replace('.', ',')}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Desempenho da Equipe</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderCell}>Funcionário</Text>
          <Text style={styles.tableHeaderCellRight}>Lançamentos</Text>
          <Text style={styles.tableHeaderCellRight}>Produzido (R$)</Text>
        </View>
        {data.employeePerformance.map((e: any, i: number) => (
          <View key={i} style={styles.row}>
            <Text style={styles.cellBold}>{e.name} ({e.code})</Text>
            <Text style={styles.cellRight}>{e.count}</Text>
            <Text style={styles.cellRightBold}>{e.total.toFixed(2).replace('.', ',')}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>TOTAL DE LANÇAMENTOS</Text>
          <Text style={styles.summaryValue}>{data.totalEntries}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>RECEITA TOTAL BRUTA</Text>
          <Text style={styles.summaryValue}>R$ {data.totalRevenue.toFixed(2).replace('.', ',')}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Xerox Manager v1.0 - Gestão Digital</Text>
        <Text style={styles.footerText}>Gerado em {new Date().toLocaleString('pt-BR')}</Text>
      </View>
    </Page>
  </Document>
)

function formatRangeDate(value?: string | null) {
  if (!value) return 'início'
  return new Date(value).toLocaleDateString('pt-BR')
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const fromStr = searchParams.get('from')
    const toStr = searchParams.get('to')
    const from = fromStr ? new Date(fromStr) : undefined
    const to = toStr ? new Date(toStr) : undefined
    const userId = searchParams.get('userId') || 'all'

    const data = await getReportData({ from, to, userId })
    const range = `${formatRangeDate(fromStr)} até ${toStr ? formatRangeDate(toStr) : 'hoje'}`

    const buffer = await renderToBuffer(<MyDocument data={data} range={range} />)
    const timestamp = new Date().getTime()
    const reportFileName = `Relatório_Xerox_${timestamp}.pdf`

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="Xerox_Report_${timestamp}.pdf"; filename*=UTF-8''${encodeURIComponent(reportFileName)}`,
        'Content-Type': 'application/pdf',
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

