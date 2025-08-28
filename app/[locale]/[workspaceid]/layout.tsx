"use client"

import { Dashboard } from "@/components/ui/dashboard"
import { ChatbotUIContext } from "@/context/context"
import { getFromLocalStorage, setInLocalStorage } from "@/lib/local-storage"
import { LLMID } from "@/types"
import { useParams, useSearchParams } from "next/navigation"
import { ReactNode, useContext, useEffect, useState } from "react"
import Loading from "../loading"

interface WorkspaceLayoutProps {
  children: ReactNode
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const params = useParams()
  const searchParams = useSearchParams()
  const workspaceId = params.workspaceid as string

  const {
    setChatSettings,
    setAssistants,
    setAssistantImages,
    setChats,
    setCollections,
    setFolders,
    setFiles,
    setPresets,
    setPrompts,
    setTools,
    setModels,
    setSelectedWorkspace,
    setSelectedChat,
    setChatMessages,
    setUserInput,
    setIsGenerating,
    setFirstTokenReceived,
    setChatFiles,
    setChatImages,
    setNewMessageFiles,
    setNewMessageImages,
    setShowFilesDisplay
  } = useContext(ChatbotUIContext)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => await fetchWorkspaceData(workspaceId))()

    setUserInput("")
    setChatMessages([])
    setSelectedChat(null)

    setIsGenerating(false)
    setFirstTokenReceived(false)

    setChatFiles([])
    setChatImages([])
    setNewMessageFiles([])
    setNewMessageImages([])
    setShowFilesDisplay(false)
  }, [workspaceId])

  const fetchWorkspaceData = async (workspaceId: string) => {
    setLoading(true)

    const workspace = getFromLocalStorage(`workspace_${workspaceId}`)
    setSelectedWorkspace(workspace)

    setAssistants(getFromLocalStorage("assistants") || [])
    setChats(getFromLocalStorage("chats") || [])
    setCollections(getFromLocalStorage("collections") || [])
    setFolders(getFromLocalStorage("folders") || [])
    setFiles(getFromLocalStorage("files") || [])
    setPresets(getFromLocalStorage("presets") || [])
    setPrompts(getFromLocalStorage("prompts") || [])
    setTools(getFromLocalStorage("tools") || [])
    setModels(getFromLocalStorage("models") || [])

    // Create a default workspace if one doesn't exist
    if (!workspace) {
      const newWorkspace = {
        id: workspaceId,
        name: "My Workspace",
        default_model: "gpt-4-1106-preview",
        default_prompt: "You are a friendly, helpful AI assistant.",
        default_temperature: 0.5,
        default_context_length: 4096,
        include_profile_context: true,
        include_workspace_instructions: true,
        embeddings_provider: "openai"
      }
      setInLocalStorage(`workspace_${workspaceId}`, newWorkspace)
      setSelectedWorkspace(newWorkspace)
    }

    setChatSettings({
      model: (searchParams.get("model") ||
        workspace?.default_model ||
        "gpt-4-1106-preview") as LLMID,
      prompt:
        workspace?.default_prompt ||
        "You are a friendly, helpful AI assistant.",
      temperature: workspace?.default_temperature || 0.5,
      contextLength: workspace?.default_context_length || 4096,
      includeProfileContext: workspace?.include_profile_context || true,
      includeWorkspaceInstructions:
        workspace?.include_workspace_instructions || true,
      embeddingsProvider:
        (workspace?.embeddings_provider as "openai" | "local") || "openai"
    })

    setLoading(false)
  }

  if (loading) {
    return <Loading />
  }

  return <Dashboard>{children}</Dashboard>
}
