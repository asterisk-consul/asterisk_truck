import { computed } from 'vue'

import type { Ref } from 'vue'

import type { DocumentsType } from '../types/documents-types.types'

export interface SelectMenuItem {
  label: string
  value: string
}

export function useDocumentsTypes(documentsTypes: Ref<DocumentsType[]>) {
  const items = computed<SelectMenuItem[]>(() =>
    documentsTypes.value.map((documentType) => ({
      label:
        documentType.code && documentType.code.length > 0
          ? `${documentType.code} - ${documentType.name}`
          : documentType.name,

      value: documentType.id
    }))
  )

  return {
    items
  }
}
