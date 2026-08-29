import {
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  endpoint: string;
  publicBaseUrl: string;
};

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export function getR2Config(): R2Config {
  const accountId = requiredEnv("R2_ACCOUNT_ID");
  const endpoint =
    process.env.R2_ENDPOINT?.trim() ||
    `https://${accountId}.r2.cloudflarestorage.com`;

  return {
    accountId,
    accessKeyId: requiredEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requiredEnv("R2_SECRET_ACCESS_KEY"),
    bucket: requiredEnv("R2_BUCKET_NAME"),
    endpoint: endpoint.replace(/\/+$/, ""),
    publicBaseUrl: requiredEnv("R2_PUBLIC_BASE_URL").replace(/\/+$/, ""),
  };
}

let cachedClient: S3Client | null = null;
let cachedFingerprint = "";

export function getR2Client(): S3Client {
  const config = getR2Config();
  const fingerprint = [
    config.accountId,
    config.accessKeyId,
    config.endpoint,
  ].join("|");

  if (!cachedClient || cachedFingerprint !== fingerprint) {
    cachedClient = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    cachedFingerprint = fingerprint;
  }

  return cachedClient;
}

export async function createR2UploadUrl(input: {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}) {
  const config = getR2Config();
  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: input.key,
    ContentType: input.contentType,
  });

  return getSignedUrl(client, command, {
    expiresIn: Math.max(60, Math.min(input.expiresInSeconds ?? 900, 3600)),
  });
}

export async function assertR2ObjectExists(key: string) {
  const config = getR2Config();
  const client = getR2Client();

  const result = await client.send(
    new HeadObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );

  return {
    contentLength: result.ContentLength ?? null,
    contentType: result.ContentType ?? null,
    etag: result.ETag ?? null,
  };
}

export async function testR2Connection() {
  const config = getR2Config();
  const client = getR2Client();

  await client.send(
    new ListObjectsV2Command({
      Bucket: config.bucket,
      MaxKeys: 1,
    }),
  );

  return {
    bucket: config.bucket,
    publicBaseUrl: config.publicBaseUrl,
  };
}

export function r2PublicUrl(key: string): string {
  const config = getR2Config();
  const encodedKey = key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${config.publicBaseUrl}/${encodedKey}`;
}
