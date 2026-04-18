import { clearTokens, getAccessToken, getRefreshToken, saveTokens, type Tokens } from "@/src/auth/token-store";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type FetchOptions = {
  body?: unknown;
  headers?: Record<string, string>;
  retryOn401?: boolean;
};

type ApiErrorShape = {
  ok?: boolean;
  error?: {
    code?: string;
    message?: string;
  };
};

let refreshPromise: Promise<void> | null = null;

async function refreshTokens() {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("Session expired");

  refreshPromise = (async () => {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      await clearTokens();
      throw new Error("Session expired");
    }

    const data = (await res.json()) as { ok: boolean; accessToken: string; refreshToken: string };
    if (!data.ok) {
      await clearTokens();
      throw new Error("Session expired");
    }

    await saveTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function fetchJSON<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const runRequest = () =>
    fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

  let res = await runRequest();

  if (res.status === 401 && options.retryOn401 !== false) {
    await refreshTokens();
    const nextToken = getAccessToken();
    if (nextToken) headers.Authorization = `Bearer ${nextToken}`;
    res = await runRequest();
  }

  if (!res.ok) {
    const errorBody = (await res.json().catch(() => ({}))) as ApiErrorShape;
    throw new Error(errorBody.error?.message || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function uploadToPresignedUrl(uploadUrl: string, fileUri: string, mimeType: string) {
  const fileResponse = await fetch(fileUri);
  const blob = await fileResponse.blob();
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": mimeType || "image/jpeg",
    },
    body: blob,
  });
  if (!uploadRes.ok) {
    throw new Error("Photo upload failed");
  }
}

export type MeResponse = {
  ok: true;
  user: {
    _id: string;
    societyId: string;
    role: "user" | "admin";
    status: "pending" | "active" | "blocked";
    name: string;
    email: string;
    phone?: string;
    flatNumber?: string;
  };
};

export type Notice = {
  _id: string;
  title: string;
  body: string;
  audience: string;
  publishedAt?: string;
};

export type Complaint = {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved" | "rejected";
  attachments: Array<{ fileId: string; url: string; type: string; name: string }>;
  createdAt: string;
};

export type MaintenanceBill = {
  _id: string;
  period: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  status: "unpaid" | "partial" | "paid" | "overdue";
};

export async function apiLogin(email: string, password: string): Promise<Tokens> {
  const data = await fetchJSON<{ ok: true; accessToken: string; refreshToken: string }>("POST", "/api/auth/login", {
    body: { email, password },
    retryOn401: false,
  });
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
}

export async function apiLogout() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return;
  await fetchJSON<{ ok: true }>("POST", "/api/auth/logout", {
    body: { refreshToken },
    retryOn401: false,
  }).catch(() => undefined);
}

export function getApiBaseUrl() {
  return API_BASE;
}

export async function getMe() {
  return fetchJSON<MeResponse>("GET", "/api/me");
}

export async function getNotices() {
  return fetchJSON<{ ok: true; notices: Notice[] }>("GET", "/api/notices");
}

export async function getComplaints() {
  return fetchJSON<{ ok: true; complaints: Complaint[] }>("GET", "/api/complaints");
}

export async function createComplaint(input: {
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  attachments: Array<{ fileId: string; url: string; type: string; name: string }>;
}) {
  return fetchJSON<{ ok: true; complaint: Complaint }>("POST", "/api/complaints", {
    body: input,
  });
}

export async function getMaintenanceBills() {
  return fetchJSON<{ ok: true; bills: MaintenanceBill[] }>("GET", "/api/maintenance/bills");
}

export async function getPresignedUrl(input: { mimeType: string; size: number; fileName: string }) {
  return fetchJSON<{ ok: true; fileId: string; key: string; uploadUrl: string; publicUrl: string }>(
    "POST",
    "/api/files/presign",
    { body: input },
  );
}
