import type { NavigationMenuItem } from '@nuxt/ui'

export const navigationLinks = [
  [
    {
      label: 'Inicio',
      icon: 'i-lucide-house',
      to: '/'
    },
    {
      label: 'Kilometros',
      icon: 'i-lucide-truck',
      to: '/VKilomentros'
    },
    {
      label: 'Compras',
      icon: 'i-lucide-folder-closed',
      to: '/Vcompras'
    },
    {
      label: 'Settings',
      to: '/settings',
      icon: 'i-lucide-settings',
      defaultOpen: true,
      type: 'trigger',
      children: [
        { label: 'General', to: '/settings', exact: true },
        { label: 'Members', to: '/settings/members' },
        { label: 'Notifications', to: '/settings/notifications' },
        { label: 'Security', to: '/settings/security' }
      ]
    }
  ],
  [
    {
      label: 'Documentacion',
      icon: 'i-lucide-book-text',
      to: 'https://asterisk-consul.github.io/donandresdoc/',
      target: '_blank'
    },
    {
      label: 'Help & Support',
      icon: 'i-lucide-info',
      to: 'https://github.com/nuxt-ui-templates/dashboard',
      target: '_blank'
    }
  ]
] as NavigationMenuItem[][]
