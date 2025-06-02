import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { createR2 } from '@/lib/r2'

export async function GET(request: NextRequest) {
  const u = await auth()
  if (!process.env.NEXT_PUBLIC_ADMIN_ID.split(',').includes(u?.user?.id ?? '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 })
  }

  try {
    const r2 = createR2()
    const object = await r2.get(key)

    if (!object) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    const headers = new Headers()
    headers.set('Content-Type', object.httpMetadata?.contentType || 'image/png')
    headers.set('Cache-Control', 'public, max-age=31536000')

    return new NextResponse(object.body, {
      headers
    })
  } catch (error) {
    console.error('Error retrieving image from R2:', error)
    return NextResponse.json({ error: 'Failed to retrieve image' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const u = await auth()
  if (!process.env.NEXT_PUBLIC_ADMIN_ID.split(',').includes(u?.user?.id ?? '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(buffer)

    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '-')
    const filename = `${Date.now()}-${sanitizedFilename}`

    const r2 = createR2()
    await r2.put(filename, fileBuffer, {
      httpMetadata: {
        contentType: file.type
      }
    })

    return NextResponse.json({
      success: true,
      url: `${process.env.NEXT_PUBLIC_R2_DOMAIN}/${filename}`,
      filename
    })
  } catch (error) {
    console.error('Error uploading to R2:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
