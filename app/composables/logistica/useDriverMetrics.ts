import { computed } from 'vue'
import type { Driver } from '~/types/logistica/transport/drivers'
import { getExpirationStatus } from '~/utils/expiration'

export function useDriverMetrics(drivers: Ref<Driver[]>) {
  const total = computed(() => drivers.value.length)

  const active = computed(() => drivers.value.filter((d) => d.active).length)

  const inactive = computed(() => drivers.value.filter((d) => !d.active).length)

  const licenseExpired = computed(
    () =>
      drivers.value.filter(
        (d) => getExpirationStatus(d.license_expiration) === 'expired'
      ).length
  )

  const licenseExpiring = computed(
    () =>
      drivers.value.filter(
        (d) => getExpirationStatus(d.license_expiration) === 'warning'
      ).length
  )

  const licenseValid = computed(
    () =>
      drivers.value.filter(
        (d) => getExpirationStatus(d.license_expiration) === 'valid'
      ).length
  )

  return {
    total,
    active,
    inactive,
    licenseExpired,
    licenseExpiring,
    licenseValid
  }
}
