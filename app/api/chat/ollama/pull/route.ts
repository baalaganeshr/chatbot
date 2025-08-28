import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { model } = await req.json()

  if (!model) {
    return new NextResponse(JSON.stringify({ message: "Model is required" }), {
      status: 400
    })
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_OLLAMA_URL}/api/pull`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: model, stream: true })
      }
    )

    if (!response.body) {
      return new NextResponse(
        JSON.stringify({ message: "No response body from Ollama" }),
        { status: 500 }
      )
    }

    const reader = response.body.getReader()
    const stream = new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            break
          }
          controller.enqueue(value)
        }
        controller.close()
        reader.releaseLock()
      }
    })

    return new NextResponse(stream, {
      headers: { "Content-Type": "application/json" }
    })
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ message: error.message }), {
      status: 500
    })
  }
}
