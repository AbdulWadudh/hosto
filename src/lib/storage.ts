import "server-only"
import { randomUUID } from "node:crypto"
import { extname } from "node:path"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { env } from "@/config/env"

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
])

export const maxUploadBytes = 8 * 1024 * 1024

const client = new S3Client({
  region: env.s3.region,
  endpoint: env.s3.endpoint,
  forcePathStyle: true,
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
  credentials: {
    accessKeyId: env.s3.accessKeyId,
    secretAccessKey: env.s3.secretAccessKey,
  },
})

export function isAllowedImageType(contentType: string): boolean {
  return allowedTypes.has(contentType)
}

export function publicUrlFor(key: string): string {
  return `${env.s3.endpoint}/${env.s3.bucket}/${key}`
}

export async function createImageUpload(input: {
  ownerId: string
  fileName: string
  contentType: string
}): Promise<{ uploadUrl: string; publicUrl: string }> {
  if (!isAllowedImageType(input.contentType)) {
    throw new Error(`Unsupported image type: ${input.contentType}`)
  }

  const extension = extname(input.fileName).toLowerCase().slice(0, 8)
  const key = `properties/${input.ownerId}/${randomUUID()}${extension}`

  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: env.s3.bucket,
      Key: key,
      ContentType: input.contentType,
    }),
    { expiresIn: 300 }
  )

  return { uploadUrl, publicUrl: publicUrlFor(key) }
}
