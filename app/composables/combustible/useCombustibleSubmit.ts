import { ref } from 'vue'
import { postData } from '~/composables/apiService'
import type { CombustibleForm } from '@/components/combustible/combustibleForm'
import { resolveFlowConfig } from './combustible.builder'
import { buildCabecera, buildCuerpo } from './combustible.builder'

export function useCombustibleSubmit() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function submit(form: CombustibleForm) {
    loading.value = true
    error.value = null

    try {
      // 1️⃣ resolver flow / status según tipo
      const cfg = resolveFlowConfig(form)

      // 2️⃣ guardar cabecera
      const cabeceraPayload = buildCabecera(form, cfg)
      const cabResp = await postData(
        '/donandres/workspace/saveRegistroCab',
        cabeceraPayload
      )

      const cabeceraId = cabResp?.id
      if (!cabeceraId) {
        throw new Error('No se pudo crear la cabecera de combustible')
      }

      // 3️⃣ guardar cuerpo
      const cuerpoPayload = buildCuerpo(form, cfg, cabeceraId)
      const cuerpoResp = await postData(
        '/donandres/workspace/saveRegistroCuerpo',
        cuerpoPayload
      )

      const cuerpoId = cuerpoResp?.id
      if (!cuerpoId) {
        throw new Error('No se pudo crear el cuerpo de combustible')
      }

      // 4️⃣ avanzar estado (cabecera + cuerpo)
      await postData('/donandres/workspace/setProximoEstadoCuerposYCab', {
        siguienteEstadoCommandList: [
          {
            id: cuerpoId,
            sigstatusid: cfg.nextStatusId,
            macroProcesoSiguienteId: cfg.flowId
          }
        ]
      })

      return true
    } catch (e: any) {
      error.value = e?.message ?? 'Error al registrar movimiento de combustible'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    submit,
    loading,
    error
  }
}
