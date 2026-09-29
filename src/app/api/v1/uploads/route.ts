import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createImageUpload, isAllowedImageType } from "@/lib/storage"

export async function POST(request: Request) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 })
  }

  let body: { fileName?: unknown; contentType?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 })
  }

  const fileName = typeof body.fileName === "string" ? body.fileName : ""
  const contentType =
    typeof body.contentType === "string" ? body.contentType : ""

  if (!fileName || !isAllowedImageType(contentType)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP or AVIF images are accepted." },
      { status: 415 }
    )
  }

  const upload = await createImageUpload({
    ownerId: session.user.id,
    fileName,
    contentType,
  })

  return NextResponse.json(upload)
}
