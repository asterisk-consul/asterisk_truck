import { computed } from 'vue'

import type { Ref } from 'vue'

import type { Tax } from '~/modulos/erp/taxes/types/taxes.types'

export interface SelectMenuItem {
  label: string
  value: string
}

export function useTaxes(taxes: Ref<Tax[]>) {
  const items = computed<SelectMenuItem[]>(() =>
    taxes.value.map((tax) => {
      const rate = Number(tax.rate)

      const formattedRate = tax.is_percentage ? `${rate}%` : `$ ${rate}`

      return {
        label: `${tax.code} - ${tax.name} (${formattedRate})`,
        value: tax.id
      }
    })
  )

  const activeItems = computed<SelectMenuItem[]>(() =>
    taxes.value
      .filter((tax) => tax.active)
      .map((tax) => {
        const rate = Number(tax.rate)

        const formattedRate = tax.is_percentage ? `${rate}%` : `$ ${rate}`

        return {
          label: `${tax.code} - ${tax.name} (${formattedRate})`,
          value: tax.id
        }
      })
  )

  const groupedByType = computed(() => {
    return taxes.value.reduce(
      (acc, tax) => {
        if (!acc[tax.tax_type]) {
          acc[tax.tax_type] = []
        }

        acc[tax.tax_type].push(tax)

        return acc
      },
      {} as Record<string, Tax[]>
    )
  })

  return {
    items,
    activeItems,
    groupedByType
  }
}
