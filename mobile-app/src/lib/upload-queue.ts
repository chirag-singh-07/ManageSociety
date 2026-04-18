import {
  addComplaintComment,
  createComplaint,
  getPresignedUrl,
  uploadToPresignedUrl,
} from "@/src/api/client";
import {
  addUploadJob,
  loadUploadQueue,
  saveUploadQueue,
  type LocalAttachment,
  type UploadQueueJob,
} from "@/src/lib/offline-store";

export type ComplaintSubmission = {
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high";
  attachments: LocalAttachment[];
};

export type CommentSubmission = {
  complaintId: string;
  message: string;
  attachments: LocalAttachment[];
};

export async function uploadAttachments(attachments: LocalAttachment[]) {
  const uploaded: { fileId: string; url: string; type: string; name: string }[] = [];

  for (const item of attachments) {
    const presign = await getPresignedUrl({
      mimeType: item.type,
      size: Math.max(item.size, 1),
      fileName: item.name,
    });

    await uploadToPresignedUrl(presign.uploadUrl, item.uri, item.type);
    uploaded.push({
      fileId: presign.fileId,
      url: presign.publicUrl,
      type: item.type,
      name: item.name,
    });
  }

  return uploaded;
}

async function submitComplaintOnline(payload: ComplaintSubmission) {
  const uploaded = await uploadAttachments(payload.attachments);
  await createComplaint({
    title: payload.title,
    description: payload.description,
    category: payload.category,
    priority: payload.priority,
    attachments: uploaded,
  });
}

async function submitCommentOnline(payload: CommentSubmission) {
  const uploaded = await uploadAttachments(payload.attachments);
  await addComplaintComment(payload.complaintId, {
    message: payload.message,
    attachments: uploaded,
  });
}

export async function queueComplaint(payload: ComplaintSubmission) {
  await addUploadJob({
    type: "complaint",
    payload,
  });
}

export async function queueComment(payload: CommentSubmission) {
  await addUploadJob({
    type: "comment",
    payload,
  });
}

export async function processUploadQueue() {
  const queue = await loadUploadQueue();
  if (queue.length === 0) {
    return { processed: 0, failed: 0, remaining: 0 };
  }

  const remaining: UploadQueueJob[] = [];
  let processed = 0;
  let failed = 0;

  for (const job of queue) {
    try {
      if (job.type === "complaint") {
        await submitComplaintOnline(job.payload);
      } else {
        await submitCommentOnline(job.payload);
      }
      processed += 1;
    } catch {
      failed += 1;
      remaining.push({
        ...job,
        attempts: job.attempts + 1,
      });
    }
  }

  await saveUploadQueue(remaining);

  return {
    processed,
    failed,
    remaining: remaining.length,
  };
}

export async function submitComplaintWithQueue(payload: ComplaintSubmission) {
  try {
    await submitComplaintOnline(payload);
    return { queued: false };
  } catch {
    await queueComplaint(payload);
    return { queued: true };
  }
}

export async function submitCommentWithQueue(payload: CommentSubmission) {
  try {
    await submitCommentOnline(payload);
    return { queued: false };
  } catch {
    await queueComment(payload);
    return { queued: true };
  }
}
