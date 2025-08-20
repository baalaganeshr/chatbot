import { consumeReadableStream } from "@/lib/consume-stream"
import { toast } from "sonner"

export const fetchChatResponse = async (
  url: string,
  body: object,
  isHosted: boolean,
  controller: AbortController,
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
  setChatMessages: React.Dispatch<React.SetStateAction<any[]>>
) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      signal: controller.signal
    })

    if (!response.ok) {
      if (response.status === 404 && !isHosted) {
        toast.error(
          "Model not found. Make sure you have it downloaded via Ollama."
        )
      }

      const errorData = await response.json()

      toast.error(errorData.message)

      setIsGenerating(false)
      setChatMessages(prevMessages => prevMessages.slice(0, -2))
    }

    return response
  } catch (error: any) {
    toast.error(error.message)
    setIsGenerating(false)
    setChatMessages(prevMessages => prevMessages.slice(0, -2))
    throw error
  }
}

export const processResponse = async (
  response: Response,
  lastChatMessage: any,
  isHosted: boolean,
  controller: AbortController,
  setFirstTokenReceived: React.Dispatch<React.SetStateAction<boolean>>,
  setChatMessages: React.Dispatch<React.SetStateAction<any[]>>,
  setToolInUse: React.Dispatch<React.SetStateAction<string>>
) => {
  let fullText = ""
  let contentToAdd = ""

  if (response.body) {
    await consumeReadableStream(
      response.body,
      chunk => {
        setFirstTokenReceived(true)
        setToolInUse("none")

        try {
          contentToAdd = isHosted
            ? chunk
            : chunk
                .trimEnd()
                .split("\n")
                .reduce(
                  (acc, line) => acc + JSON.parse(line).message.content,
                  ""
                )
          fullText += contentToAdd
        } catch (error) {
          console.error("Error parsing JSON:", error)
        }

        setChatMessages(prev =>
          prev.map(chatMessage => {
            if (chatMessage.message.id === lastChatMessage.message.id) {
              const updatedChatMessage = {
                message: {
                  ...chatMessage.message,
                  content: fullText
                },
                fileItems: chatMessage.fileItems
              }

              return updatedChatMessage
            }

            return chatMessage
          })
        )
      },
      controller.signal
    )

    return fullText
  } else {
    throw new Error("Response body is null")
  }
}
