export interface Tokens {
  accessToken: string
  refreshToken: string
}

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

export interface ApiResponse<T> {
  ok: boolean
  data?: T
  error?: ApiError
  requestId?: string
}
