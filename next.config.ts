import type { NextConfig } from "next"

const storageEndpoint = process.env.S3_ENDPOINT
const storage = storageEndpoint ? new URL(storageEndpoint) : null
const isProduction = process.env.NODE_ENV === "production"

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: !isProduction,
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      ...(storage
        ? [
            {
              protocol: storage.protocol.replace(":", "") as "http" | "https",
              hostname: storage.hostname,
              port: storage.port,
            },
          ]
        : []),
    ],
  },
}

export default nextConfig
