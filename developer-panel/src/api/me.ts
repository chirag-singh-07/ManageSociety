import { fetchJSON } from './http'

export function getMyProfile() {
  return fetchJSON<{ ok: true; admin: { id: string; email: string; role: string } }>('GET', '/api/superadmin/me')
}

export function updatePassword(input: { currentPassword: string; newPassword: string }) {
  return fetchJSON<{ ok: true; message: string }>('PATCH', '/api/superadmin/password', { body: input })
}
