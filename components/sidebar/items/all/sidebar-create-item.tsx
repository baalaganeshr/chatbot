import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import { ChatbotUIContext } from "@/context/context"
import {
  getFromLocalStorage,
  setInLocalStorage
} from "@/lib/local-storage"
import { ContentType } from "@/types"
import { FC, useContext, useRef, useState } from "react"
import { toast } from "sonner"

interface SidebarCreateItemProps {
  isOpen: boolean
  isTyping: boolean
  onOpenChange: (isOpen: boolean) => void
  contentType: ContentType
  renderInputs: () => JSX.Element
  createState: any
}

export const SidebarCreateItem: FC<SidebarCreateItemProps> = ({
  isOpen,
  onOpenChange,
  contentType,
  renderInputs,
  createState,
  isTyping
}) => {
  const {
    selectedWorkspace,
    setChats,
    setPresets,
    setPrompts,
    setFiles,
    setCollections,
    setAssistants,
    setTools,
    setModels
  } = useContext(ChatbotUIContext)

  const buttonRef = useRef<HTMLButtonElement>(null)

  const [creating, setCreating] = useState(false)

  const createFunctions = {
    chats: (createState: any, workspaceId: string) => {
      const newChat = {
        ...createState,
        id: crypto.randomUUID(),
        user_id: "local",
        workspace_id: workspaceId
      }
      const chats = getFromLocalStorage("chats") || []
      setInLocalStorage("chats", [...chats, newChat])
      return newChat
    },
    presets: (createState: any, workspaceId: string) => {
      const newPreset = {
        ...createState,
        id: crypto.randomUUID(),
        user_id: "local",
        workspace_id: workspaceId
      }
      const presets = getFromLocalStorage("presets") || []
      setInLocalStorage("presets", [...presets, newPreset])
      return newPreset
    },
    prompts: (createState: any, workspaceId: string) => {
      const newPrompt = {
        ...createState,
        id: crypto.randomUUID(),
        user_id: "local",
        workspace_id: workspaceId
      }
      const prompts = getFromLocalStorage("prompts") || []
      setInLocalStorage("prompts", [...prompts, newPrompt])
      return newPrompt
    },
    files: (createState: any, workspaceId: string) => {
      const newFile = {
        ...createState,
        id: crypto.randomUUID(),
        user_id: "local",
        workspace_id: workspaceId
      }
      const files = getFromLocalStorage("files") || []
      setInLocalStorage("files", [...files, newFile])
      return newFile
    },
    collections: (createState: any, workspaceId: string) => {
      const newCollection = {
        ...createState,
        id: crypto.randomUUID(),
        user_id: "local",
        workspace_id: workspaceId
      }
      const collections = getFromLocalStorage("collections") || []
      setInLocalStorage("collections", [...collections, newCollection])
      return newCollection
    },
    assistants: (createState: any, workspaceId: string) => {
      const newAssistant = {
        ...createState,
        id: crypto.randomUUID(),
        user_id: "local",
        workspace_id: workspaceId
      }
      const assistants = getFromLocalStorage("assistants") || []
      setInLocalStorage("assistants", [...assistants, newAssistant])
      return newAssistant
    },
    tools: (createState: any, workspaceId: string) => {
      const newTool = {
        ...createState,
        id: crypto.randomUUID(),
        user_id: "local",
        workspace_id: workspaceId
      }
      const tools = getFromLocalStorage("tools") || []
      setInLocalStorage("tools", [...tools, newTool])
      return newTool
    },
    models: (createState: any, workspaceId: string) => {
      const newModel = {
        ...createState,
        id: crypto.randomUUID(),
        user_id: "local",
        workspace_id: workspaceId
      }
      const models = getFromLocalStorage("models") || []
      setInLocalStorage("models", [...models, newModel])
      return newModel
    }
  }

  const stateUpdateFunctions = {
    chats: setChats,
    presets: setPresets,
    prompts: setPrompts,
    files: setFiles,
    collections: setCollections,
    assistants: setAssistants,
    tools: setTools,
    models: setModels
  }

  const handleCreate = async () => {
    try {
      if (!selectedWorkspace) return
      if (isTyping) return // Prevent creation while typing

      const createFunction = createFunctions[contentType]
      const setStateFunction = stateUpdateFunctions[contentType]

      if (!createFunction || !setStateFunction) return

      setCreating(true)

      const newItem = await createFunction(createState, selectedWorkspace.id)

      setStateFunction((prevItems: any) => [...prevItems, newItem])

      onOpenChange(false)
      setCreating(false)
    } catch (error) {
      toast.error(`Error creating ${contentType.slice(0, -1)}. ${error}.`)
      setCreating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isTyping && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      buttonRef.current?.click()
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        className="flex min-w-[450px] flex-col justify-between overflow-auto"
        side="left"
        onKeyDown={handleKeyDown}
      >
        <div className="grow overflow-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold">
              Create{" "}
              {contentType.charAt(0).toUpperCase() + contentType.slice(1, -1)}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-3">{renderInputs()}</div>
        </div>

        <SheetFooter className="mt-2 flex justify-between">
          <div className="flex grow justify-end space-x-2">
            <Button
              disabled={creating}
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button disabled={creating} ref={buttonRef} onClick={handleCreate}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
