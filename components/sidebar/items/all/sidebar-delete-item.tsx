import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { ChatbotUIContext } from "@/context/context"
import {
  getFromLocalStorage,
  setInLocalStorage
} from "@/lib/local-storage"
import { ContentType, DataItemType } from "@/types"
import { FC, useContext, useRef, useState } from "react"

interface SidebarDeleteItemProps {
  item: DataItemType
  contentType: ContentType
}

export const SidebarDeleteItem: FC<SidebarDeleteItemProps> = ({
  item,
  contentType
}) => {
  const {
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

  const [showDialog, setShowDialog] = useState(false)

  const deleteFunctions = {
    chats: (chat: any) => {
      const chats = getFromLocalStorage("chats") || []
      const updatedChats = chats.filter((c: any) => c.id !== chat.id)
      setInLocalStorage("chats", updatedChats)
    },
    presets: (preset: any) => {
      const presets = getFromLocalStorage("presets") || []
      const updatedPresets = presets.filter((p: any) => p.id !== preset.id)
      setInLocalStorage("presets", updatedPresets)
    },
    prompts: (prompt: any) => {
      const prompts = getFromLocalStorage("prompts") || []
      const updatedPrompts = prompts.filter((p: any) => p.id !== prompt.id)
      setInLocalStorage("prompts", updatedPrompts)
    },
    files: (file: any) => {
      const files = getFromLocalStorage("files") || []
      const updatedFiles = files.filter((f: any) => f.id !== file.id)
      setInLocalStorage("files", updatedFiles)
    },
    collections: (collection: any) => {
      const collections = getFromLocalStorage("collections") || []
      const updatedCollections = collections.filter(
        (c: any) => c.id !== collection.id
      )
      setInLocalStorage("collections", updatedCollections)
    },
    assistants: (assistant: any) => {
      const assistants = getFromLocalStorage("assistants") || []
      const updatedAssistants = assistants.filter(
        (a: any) => a.id !== assistant.id
      )
      setInLocalStorage("assistants", updatedAssistants)
    },
    tools: (tool: any) => {
      const tools = getFromLocalStorage("tools") || []
      const updatedTools = tools.filter((t: any) => t.id !== tool.id)
      setInLocalStorage("tools", updatedTools)
    },
    models: (model: any) => {
      const models = getFromLocalStorage("models") || []
      const updatedModels = models.filter((m: any) => m.id !== model.id)
      setInLocalStorage("models", updatedModels)
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

  const handleDelete = async () => {
    const deleteFunction = deleteFunctions[contentType]
    const setStateFunction = stateUpdateFunctions[contentType]

    if (!deleteFunction || !setStateFunction) return

    await deleteFunction(item as any)

    setStateFunction((prevItems: any) =>
      prevItems.filter((prevItem: any) => prevItem.id !== item.id)
    )

    setShowDialog(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.stopPropagation()
      buttonRef.current?.click()
    }
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button className="text-red-500" variant="ghost">
          Delete
        </Button>
      </DialogTrigger>

      <DialogContent onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Delete {contentType.slice(0, -1)}</DialogTitle>

          <DialogDescription>
            Are you sure you want to delete {item.name}?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowDialog(false)}>
            Cancel
          </Button>

          <Button ref={buttonRef} variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
