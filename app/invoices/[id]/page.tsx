import { MainLayout } from "@/components/main-layout"
import { InvoiceDetail } from "@/components/invoices/invoice-detail"

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <MainLayout>
      <InvoiceDetail id={id} />
    </MainLayout>
  )
}

