// mapDocumentToFacturaForm.ts

import type {
  Document,
  DocumentItem,
  DocumentItemTax,
  FacturaFormValues,
  FacturaItem,
  FacturaTax
} from '~/modulos/erp/facturas/types/factura.types'

export function mapDocumentToFacturaForm(
  document: Document
): FacturaFormValues {
  const items: FacturaItem[] =
    document.document_items?.map((item: DocumentItem) => {
      const taxes: FacturaTax[] =
        item.document_item_taxes?.map((tax: DocumentItemTax) => ({
          tax_id: tax.tax_id,

          name: tax.taxes?.name,

          code: tax.taxes?.code,

          tax_rate: Number(tax.tax_rate ?? 0),

          tax_amount: Number(tax.tax_amount ?? 0),

          calculation_level: 'line'
        })) ?? []

      const totalTaxes = taxes.reduce(
        (acc, tax) => acc + Number(tax.tax_amount),
        0
      )

      const subtotal = Number(item.price ?? 0)

      return {
        id: item.id,

        product_id: item.product_id,

        product_name: item.products?.name ?? '',

        product_code: item.products?.code ?? '',

        quantity: Number(item.quantity ?? 0),

        unit_price: Number(item.unit_price ?? 0),

        price: subtotal,

        subtotal,

        taxes,

        total_taxes: totalTaxes,

        total: subtotal + totalTaxes
      }
    }) ?? []

  const documentTaxes: FacturaTax[] =
    document.document_taxes?.map((tax) => ({
      tax_id: tax.tax_id,

      name: tax.taxes?.name,

      code: tax.taxes?.code,

      tax_rate: Number(tax.tax_rate ?? 0),

      taxable_base: Number(tax.taxable_base ?? 0),

      tax_amount: Number(tax.tax_amount ?? 0),

      calculation_level: 'document'
    })) ?? []

  return {
    id: document.id,

    document_type_id: document.document_type_id,

    party_id: document.party_id,

    date: document.date
      ? new Date(document.date as string).toISOString().split('T')[0]
      : '',

    descrip: document.descrip ?? '',

    ref: document.ref ?? '',

    status: document.status,

    subtotal: Number(document.subtotal ?? 0),

    exempt_amount: Number(document.exempt_amount ?? 0),

    taxable_base:
      Number(document.subtotal ?? 0) - Number(document.exempt_amount ?? 0),

    total_taxes: Number(document.total_taxes ?? 0),

    total: Number(document.total ?? 0),

    items,

    document_taxes: documentTaxes
  }
}
