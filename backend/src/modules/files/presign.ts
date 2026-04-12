import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../config/env';
import { ApiError } from '../../shared/apiError';
import { randomId } from '../../shared/id';

const allowedMime = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
]);

function s3Client() {
  if (!env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY || !env.S3_BUCKET) {
    throw new ApiError(400, 'S3_NOT_CONFIGURED', 'File storage not configured');
  }
  return new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: !!env.S3_ENDPOINT,
  });
}

export async function createPresign(params: {
  societyId: string;
  userId: string;
  mimeType: string;
  size: number;
  fileName: string;
}) {
  if (!allowedMime.has(params.mimeType)) {
    throw new ApiError(400, 'FILE_TYPE_NOT_ALLOWED', 'Mime type not allowed');
  }

  const fileId = randomId(16);
  const safeName = params.fileName.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120);
  const key = `societies/${params.societyId}/uploads/${fileId}_${safeName}`;

  const client = s3Client();
  const cmd = new PutObjectCommand({
    Bucket: env.S3_BUCKET!,
    Key: key,
    ContentType: params.mimeType,
    ContentLength: params.size,
    Metadata: {
      societyId: params.societyId,
      uploadedBy: params.userId,
      fileId,
    },
  });

  const uploadUrl = await getSignedUrl(client, cmd, { expiresIn: 60 * 5 });
  const publicUrl = env.S3_PUBLIC_BASE_URL ? `${env.S3_PUBLIC_BASE_URL}/${key}` : '';

  return { fileId, key, uploadUrl, publicUrl };
}
