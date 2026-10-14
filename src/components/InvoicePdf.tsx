import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export type InvoiceLine = { id: string; description: string; qty: number; rate: number };
export type InvoiceData = {
  number: string; issueDate: string; dueDate: string; fromName: string; fromEmail: string; fromAddress: string;
  clientName: string; clientEmail: string; clientAddress: string; notes: string; taxRate: number; currency: string;
  items: InvoiceLine[];
};

const styles = StyleSheet.create({ page: { padding: 48, fontFamily: "Helvetica", color: "#26332c", fontSize: 10 }, top: { flexDirection: "row", justifyContent: "space-between", marginBottom: 42 }, brand: { color: "#28745a", fontSize: 18, fontFamily: "Helvetica-Bold" }, title: { fontSize: 28, color: "#d5ddd8", letterSpacing: 2, fontFamily: "Helvetica-Bold" }, muted: { color: "#85908b", lineHeight: 1.6 }, row: { flexDirection: "row", justifyContent: "space-between" }, section: { marginBottom: 24 }, label: { fontSize: 8, color: "#85908b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }, bold: { fontFamily: "Helvetica-Bold", marginBottom: 4 }, tableHead: { flexDirection: "row", backgroundColor: "#f3f7f4", padding: 9, color: "#627067", fontSize: 8 }, tableRow: { flexDirection: "row", padding: 10, borderBottom: "1 solid #e8ece9" }, desc: { flex: 1 }, qty: { width: 50, textAlign: "right" }, rate: { width: 75, textAlign: "right" }, amount: { width: 85, textAlign: "right" }, summary: { width: 220, alignSelf: "flex-end", marginTop: 14 }, sumRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, color: "#647169" }, total: { borderTop: "1 solid #dfe7e1", paddingTop: 10, color: "#28745a", fontSize: 13, fontFamily: "Helvetica-Bold" }, note: { marginTop: 40, color: "#7e8982", lineHeight: 1.5 } });
const money = (amount: number, currency: string) => new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

export default function InvoicePdf({ data }: { data: InvoiceData }) {
  const subtotal = data.items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const tax = subtotal * data.taxRate / 100;
  return <Document title={`Invoice ${data.number}`}><Page size="A4" style={styles.page}>
    <View style={styles.top}><View><Text style={styles.brand}>{data.fromName || "Your studio"}</Text><Text style={styles.muted}>{data.fromEmail}{data.fromAddress ? `\n${data.fromAddress}` : ""}</Text></View><View><Text style={styles.title}>INVOICE</Text><Text style={[styles.muted, { textAlign: "right", marginTop: 8 }]}>No. {data.number}{`\n`}Issued {data.issueDate}{`\n`}Due {data.dueDate}</Text></View></View>
    <View style={[styles.row, styles.section]}><View><Text style={styles.label}>Bill to</Text><Text style={styles.bold}>{data.clientName || "Client name"}</Text><Text style={styles.muted}>{data.clientEmail}{data.clientAddress ? `\n${data.clientAddress}` : ""}</Text></View><View><Text style={styles.label}>Payment due</Text><Text style={styles.bold}>{data.dueDate}</Text></View></View>
    <View style={styles.tableHead}><Text style={styles.desc}>DESCRIPTION</Text><Text style={styles.qty}>QTY</Text><Text style={styles.rate}>RATE</Text><Text style={styles.amount}>AMOUNT</Text></View>
    {data.items.map(item => <View key={item.id} style={styles.tableRow}><Text style={styles.desc}>{item.description}</Text><Text style={styles.qty}>{item.qty}</Text><Text style={styles.rate}>{money(item.rate, data.currency)}</Text><Text style={styles.amount}>{money(item.qty * item.rate, data.currency)}</Text></View>)}
    <View style={styles.summary}><View style={styles.sumRow}><Text>Subtotal</Text><Text>{money(subtotal, data.currency)}</Text></View><View style={styles.sumRow}><Text>Tax ({data.taxRate}%)</Text><Text>{money(tax, data.currency)}</Text></View><View style={[styles.sumRow, styles.total]}><Text>Total due</Text><Text>{money(subtotal + tax, data.currency)}</Text></View></View>
    {data.notes ? <View style={styles.note}><Text style={styles.label}>Note</Text><Text>{data.notes}</Text></View> : null}
    <View style={{ position: "absolute", bottom: 28, left: 48, right: 48, borderTop: "1 solid #e8ece9", paddingTop: 10 }}><Text style={[styles.muted, { textAlign: "center", fontSize: 8 }]}>Thank you for your business.</Text></View>
  </Page></Document>;
}
