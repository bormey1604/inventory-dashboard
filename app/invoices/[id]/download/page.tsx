import { InvoicePdfGenerator } from "@/components/invoices/invoice-pdf-generator"

export default async function InvoiceDownloadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <InvoicePdfGenerator id={id} />
}

