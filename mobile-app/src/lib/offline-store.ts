import * as SecureStore from "expo-secure-store";

const CACHE_KEY = "managesociety_cache_v1";
const QUEUE_KEY = "managesociety_upload_queue_v1";

type CacheRecord = Record<string, { updatedAt: string; data: unknown }>;

export type LocalAttachment = {
  uri: string;
  name: string;
  type: string;
  size: number;
};

type BaseQueueJob = {
  id: string;
  createdAt: string;
  attempts: number;
};

export type ComplaintQueueJob = BaseQueueJob & {
  type: "complaint";
  payload: {
    title: string;
    description: string;
    category: string;
    priority: "low" | "medium" | "high";
    attachments: LocalAttachment[];
  };
};

export type CommentQueueJob = BaseQueueJob & {
  type: "comment";
  payload: {
    complaintId: string;
    message: string;
    attachments: LocalAttachment[];
  };
};

export type UploadQueueJob = ComplaintQueueJob | CommentQueueJob;

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await SecureStore.getItemAsync(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    await SecureStore.deleteItemAsync(key);
    return fallback;
  }
}

async function writeJSON<T>(key: string, value: T) {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
}

export async function loadCachedResource<T>(key: string): Promise<{ updatedAt: string; data: T } | null> {
  const cache = await readJSON<CacheRecord>(CACHE_KEY, {});
  const record = cache[key];
  if (!record) return null;
  return { updatedAt: record.updatedAt, data: record.data as T };
}

export async function saveCachedResource<T>(key: string, data: T) {
  const cache = await readJSON<CacheRecord>(CACHE_KEY, {});
  cache[key] = {
    updatedAt: new Date().toISOString(),
    data,
  };
  await writeJSON(CACHE_KEY, cache);
}

export async function loadUploadQueue() {
  const queue = await readJSON<UploadQueueJob[]>(QUEUE_KEY, []);
  return queue.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function saveUploadQueue(queue: UploadQueueJob[]) {
  await writeJSON(QUEUE_KEY, queue);
}

export async function addUploadJob(job: Omit<UploadQueueJob, "id" | "createdAt" | "attempts">) {
  const queue = await loadUploadQueue();
  queue.push({
    ...job,
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    attempts: 0,
  } as UploadQueueJob);
  await saveUploadQueue(queue);
}

export async function getUploadQueueCount() {
  const queue = await loadUploadQueue();
  return queue.length;
}
