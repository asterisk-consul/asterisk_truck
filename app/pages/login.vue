<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
const router = useRouter()
const toast = useToast()

const fields: AuthFormField[] = [
  {
    name: 'username',   // <-- cambió de email a username
    type: 'text',       // ya no es email
    label: 'Usuario',
    placeholder: 'Ingresa tu usuario',
    required: true
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Ingresa tu contraseña',
    required: true
  },
  {
    name: 'remember',
    label: 'Recordarme',
    type: 'checkbox'
  }
]

const schema = z.object({
  username: z
    .string('Username requerido' )
    .min(3, 'Mínimo 3 caracteres'),
  password: z
    .string( 'Password requerido' )
    .min(4, 'Mínimo 4 caracteres')
})


type Schema = z.output<typeof schema>

// Estado del error dinámico
const errorMessage = ref('')
const showError = ref(false)

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const auth = useAuthStore()

  try {
    // Llamada al login asíncrono
    await auth.login(payload.data.username, payload.data.password)

    // Si llegó acá, login exitoso
    showError.value = false

    toast.add({
      title: 'Login Exitoso',
      description: `Bienvenido ${payload.data.username}`,
      color: 'success'
    })
    router.push('/')
  } catch (err: unknown) {
    // Manejar errores dinámicos
    errorMessage.value = err instanceof Error ? err.message : 'Error desconocido'
    showError.value = true
  }
}


// Cerrar alerta
function closeAlert() {
  showError.value = false
}
</script>

<template>
  <div class="flex flex-col items-center justify-center mx-auto p-4 ">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        :fields="fields"
        title="Bienvenido"
        description="Ingresa usuario y contraseña"
        icon="i-lucide-user"
        @submit="onSubmit"
      >
        <template #password-hint>
          <ULink to="#" class="text-primary font-medium" tabindex="-1">
            Olvidaste tu contraseña?
          </ULink>
        </template>

        <!-- Error dinámico -->
        <template #validation>
          <UAlert
            v-if="showError"
            :title="errorMessage"
            color="error"
            icon="i-lucide-info"
            dismissible
            @close="closeAlert"
          />
        </template>
        <template #submit>
          <UButton label="Ingresar" type="submit" class="w-full flex justify-center"/>
        </template>

        <template #footer>
          Al ingresar, aceptas nuestros
          <ULink to="#" class="text-primary font-medium">Términos de uso</ULink>.
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
