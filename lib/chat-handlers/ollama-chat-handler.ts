import { buildFinalMessages } from "@/lib/build-prompt"
import { Tables } from "@/supabase/types"
import { ChatPayload } from "@/types"
import { fetchChatResponse, processResponse } from "."

import { toast } from "sonner"

export const handleOllamaChat = async (
  payload: ChatPayload,
  profile: Tables<"profiles">,
  isRegeneration: boolean,
  newAbortController: AbortController,
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
  setFirstTokenReceived: React.Dispatch<React.SetStateAction<boolean>>,
  setChatMessages: React.Dispatch<React.SetStateAction<any[]>>,
  setToolInUse: React.Dispatch<React.SetStateAction<string>>
) => {
  try {
    const formattedMessages = await buildFinalMessages(payload, profile, [])

    const response = await fetchChatResponse(
      process.env.NEXT_PUBLIC_OLLAMA_URL + "/api/chat",
      {
        model: payload.chatSettings.model,
        messages: formattedMessages,
        options: {
          temperature: payload.chatSettings.temperature
        }
      },
      false,
      newAbortController,
      setIsGenerating,
      setChatMessages
    )

    return await processResponse(
      response,
      isRegeneration
        ? payload.chatMessages[payload.chatMessages.length - 1]
        : payload.chatMessages[payload.chatMessages.length - 1],
      false,
      newAbortController,
      setFirstTokenReceived,
      setChatMessages,
      setToolInUse
    )
  } catch (error: any) {
    toast.error(
      "An error occurred while connecting to the Ollama server. Please make sure the server is running and accessible."
    )
  }
}
