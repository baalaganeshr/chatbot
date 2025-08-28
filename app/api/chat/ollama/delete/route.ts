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
      `${process.env.NEXT_PUBLIC_OLLAMA_URL}/api/delete`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: model })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      return new NextResponse(
        JSON.stringify({
          message: `Ollama API error: ${errorText}`
        }),
        { status: response.status }
      )
    }

    return new NextResponse(
      JSON.stringify({ message: "Model deleted successfully" }),
      {
        status: 200
      }
    )
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ message: error.message }), {
      status: 500
    })
  }
}
