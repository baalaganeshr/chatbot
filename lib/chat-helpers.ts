import {
  getFromLocalStorage,
  setInLocalStorage
} from "@/lib/local-storage"
import { ChatFile, ChatMessage, ChatSettings, LLM, MessageImage } from "@/types"
import { v4 as uuidv4 } from "uuid"

export const handleRetrieval = async (
  userInput: string,
  newMessageFiles: ChatFile[],
  chatFiles: ChatFile[],
  embeddingsProvider: "openai" | "local",
  sourceCount: number
) => {
  const response = await fetch("/api/retrieval/retrieve", {
    method: "POST",
    body: JSON.stringify({
      userInput,
      fileIds: [...newMessageFiles, ...chatFiles].map(file => file.id),
      embeddingsProvider,
      sourceCount
    })
  })

  if (!response.ok) {
    console.error("Error retrieving:", response)
  }

  const { results } = (await response.json()) as any

  return results
}

export const createTempMessages = (
  messageContent: string,
  chatMessages: ChatMessage[],
  chatSettings: ChatSettings,
  b64Images: string[],
  isRegeneration: boolean,
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  selectedAssistant: any | null
) => {
  let tempUserChatMessage: ChatMessage = {
    message: {
      chat_id: "",
      assistant_id: null,
      content: messageContent,
      created_at: "",
      id: uuidv4(),
      image_paths: b64Images,
      model: chatSettings.model,
      role: "user",
      sequence_number: chatMessages.length,
      updated_at: "",
      user_id: ""
    },
    fileItems: []
  }

  let tempAssistantChatMessage: ChatMessage = {
    message: {
      chat_id: "",
      assistant_id: selectedAssistant?.id || null,
      content: "",
      created_at: "",
      id: uuidv4(),
      image_paths: [],
      model: chatSettings.model,
      role: "assistant",
      sequence_number: chatMessages.length + 1,
      updated_at: "",
      user_id: ""
    },
    fileItems: []
  }

  let newMessages = []

  if (isRegeneration) {
    const lastMessageIndex = chatMessages.length - 1
    chatMessages[lastMessageIndex].message.content = ""
    newMessages = [...chatMessages]
  } else {
    newMessages = [
      ...chatMessages,
      tempUserChatMessage,
      tempAssistantChatMessage
    ]
  }

  setChatMessages(newMessages)

  return {
    tempUserChatMessage,
    tempAssistantChatMessage
  }
}

export const handleCreateChat = async (
  chatSettings: ChatSettings,
  profile: any,
  selectedWorkspace: any,
  messageContent: string,
  selectedAssistant: any,
  newMessageFiles: ChatFile[],
  setSelectedChat: React.Dispatch<React.SetStateAction<any | null>>,
  setChats: React.Dispatch<React.SetStateAction<any[]>>,
  setChatFiles: React.Dispatch<React.SetStateAction<ChatFile[]>>
) => {
  const createdChat = {
    user_id: profile.user_id,
    workspace_id: selectedWorkspace.id,
    assistant_id: selectedAssistant?.id || null,
    context_length: chatSettings.contextLength,
    include_profile_context: chatSettings.includeProfileContext,
    include_workspace_instructions: chatSettings.includeWorkspaceInstructions,
    model: chatSettings.model,
    name: messageContent.substring(0, 100),
    prompt: chatSettings.prompt,
    temperature: chatSettings.temperature,
    embeddings_provider: chatSettings.embeddingsProvider,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const chats = getFromLocalStorage("chats") || []
  setInLocalStorage("chats", [createdChat, ...chats])

  setSelectedChat(createdChat)
  setChats(chats => [createdChat, ...chats])

  // TODO: handle chat files
  // await createChatFiles(
  //   newMessageFiles.map(file => ({
  //     user_id: profile.user_id,
  //     chat_id: createdChat.id,
  //     file_id: file.id
  //   }))
  // )

  setChatFiles(prev => [...prev, ...newMessageFiles])

  return createdChat
}

export const handleCreateMessages = async (
  chatMessages: ChatMessage[],
  currentChat: any,
  profile: any,
  modelData: LLM,
  messageContent: string,
  generatedText: string,
  newMessageImages: MessageImage[],
  isRegeneration: boolean,
  retrievedFileItems: any[],
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setChatFileItems: React.Dispatch<React.SetStateAction<any[]>>,
  setChatImages: React.Dispatch<React.SetStateAction<MessageImage[]>>,
  selectedAssistant: any | null
) => {
  const finalUserMessage = {
    chat_id: currentChat.id,
    assistant_id: null,
    user_id: profile.user_id,
    content: messageContent,
    model: modelData.modelId,
    role: "user",
    sequence_number: chatMessages.length,
    image_paths: newMessageImages.map(img => img.base64)
  }

  const finalAssistantMessage = {
    chat_id: currentChat.id,
    assistant_id: selectedAssistant?.id || null,
    user_id: profile.user_id,
    content: generatedText,
    model: modelData.modelId,
    role: "assistant",
    sequence_number: chatMessages.length + 1,
    image_paths: []
  }

  let finalChatMessages: ChatMessage[] = []

  const messages = getFromLocalStorage(`messages_${currentChat.id}`) || []

  if (isRegeneration) {
    const lastStartingMessage = messages[messages.length - 1]

    const updatedMessage = {
      ...lastStartingMessage,
      content: generatedText
    }

    const updatedMessages = messages.map((message: any) =>
      message.id === lastStartingMessage.id ? updatedMessage : message
    )

    setInLocalStorage(`messages_${currentChat.id}`, updatedMessages)

    // TODO: fix this
    // chatMessages[chatMessages.length - 1].message = updatedMessage

    finalChatMessages = [...chatMessages]

    setChatMessages(finalChatMessages)
  } else {
    setInLocalStorage(`messages_${currentChat.id}`, [
      ...messages,
      finalUserMessage,
      finalAssistantMessage
    ])

    finalChatMessages = [
      ...chatMessages,
      {
        message: finalUserMessage,
        fileItems: []
      },
      {
        message: finalAssistantMessage,
        fileItems: retrievedFileItems.map(fileItem => fileItem.id)
      }
    ]

    setChatMessages(finalChatMessages)
  }
}
