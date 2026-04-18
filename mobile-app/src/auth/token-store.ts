import * as SecureStore from "expo-secure-store";

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

const TOKENS_KEY = "managesociety_tokens_v1";

let cachedTokens: Tokens | null = null;

export function getAccessToken() {
  return cachedTokens?.accessToken ?? null;
}

export function getRefreshToken() {
  return cachedTokens?.refreshToken ?? null;
}

export function getTokens() {
  return cachedTokens;
}

export async function loadTokens() {
  const raw = await SecureStore.getItemAsync(TOKENS_KEY);
  if (!raw) {
    cachedTokens = null;
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Tokens;
    cachedTokens = parsed;
    return parsed;
  } catch {
    cachedTokens = null;
    await SecureStore.deleteItemAsync(TOKENS_KEY);
    return null;
  }
}

export async function saveTokens(tokens: Tokens) {
  cachedTokens = tokens;
  await SecureStore.setItemAsync(TOKENS_KEY, JSON.stringify(tokens));
}

export async function clearTokens() {
  cachedTokens = null;
  await SecureStore.deleteItemAsync(TOKENS_KEY);
}
