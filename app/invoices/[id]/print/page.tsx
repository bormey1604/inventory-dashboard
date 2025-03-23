import { InvoicePrint } from "@/components/invoices/invoice-print"

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <InvoicePrint id={id} />
}

