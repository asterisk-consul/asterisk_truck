// types/api.d.ts
declare global {
  interface ApiResponse<T = any> {
    status: number
    data: T
  }
}

export { }
