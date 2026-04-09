import type {
  ApiLoginResponse,
  AuthUser,
  ApiRegisterDto,
  ApiChangePasswordDto,
  ApiMessageResponse
} from './auth.types'

export const authService = {
  getFetch() {
    return useRequestFetch()
  },

  login(email: string, password: string) {
    return this.getFetch()<ApiLoginResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })
  },

  register(data: ApiRegisterDto) {
    return this.getFetch()<ApiLoginResponse>('/api/auth/register', {
      method: 'POST',
      body: data
    })
  },

  refresh(refreshToken: string) {
    return this.getFetch()<ApiLoginResponse>('/api/auth/refresh', {
      method: 'POST',
      body: { refreshToken }
    })
  },

  logout() {
    return this.getFetch()('/api/auth/logout', {
      method: 'POST'
    })
  },

  logoutAll() {
    return this.getFetch()<ApiMessageResponse>('/api/auth/logout-all', {
      method: 'POST'
    })
  },

  changePassword(data: ApiChangePasswordDto) {
    return this.getFetch()<ApiMessageResponse>('/api/auth/change-password', {
      method: 'POST',
      body: data
    })
  },

  me() {
    return this.getFetch()<AuthUser>('/api/auth/me')
  }
}
