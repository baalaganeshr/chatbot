import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import { ChatbotUIContext } from "@/context/context"
import {
  getFromLocalStorage,
  setInLocalStorage
} from "@/lib/local-storage"
import { ContentType, DataItemType } from "@/types"
import { FC, useContext, useRef, useState } from "react"
import { toast } from "sonner"
import { SidebarDeleteItem } from "./sidebar-delete-item"

interface SidebarUpdateItemProps {
  isTyping: boolean
  item: DataItemType
  contentType: ContentType
  children: React.ReactNode
  renderInputs: (renderState: any) => JSX.Element
  updateState: any
}

export const SidebarUpdateItem: FC<SidebarUpdateItemProps> = ({
  item,
  contentType,
  children,
  renderInputs,
  updateState,
  isTyping
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

  const [isOpen, setIsOpen] = useState(false)

  const updateFunctions = {
    chats: (itemId: string, updateState: any) => {
      const chats = getFromLocalStorage("chats") || []
      const updatedChats = chats.map((chat: any) =>
        chat.id === itemId ? { ...chat, ...updateState } : chat
      )
      setInLocalStorage("chats", updatedChats)
      return { ...item, ...updateState }
    },
    presets: (itemId: string, updateState: any) => {
      const presets = getFromLocalStorage("presets") || []
      const updatedPresets = presets.map((preset: any) =>
        preset.id === itemId ? { ...preset, ...updateState } : preset
      )
      setInLocalStorage("presets", updatedPresets)
      return { ...item, ...updateState }
    },
    prompts: (itemId: string, updateState: any) => {
      const prompts = getFromLocalStorage("prompts") || []
      const updatedPrompts = prompts.map((prompt: any) =>
        prompt.id === itemId ? { ...prompt, ...updateState } : prompt
      )
      setInLocalStorage("prompts", updatedPrompts)
      return { ...item, ...updateState }
    },
    files: (itemId: string, updateState: any) => {
      const files = getFromLocalStorage("files") || []
      const updatedFiles = files.map((file: any) =>
        file.id === itemId ? { ...file, ...updateState } : file
      )
      setInLocalStorage("files", updatedFiles)
      return { ...item, ...updateState }
    },
    collections: (itemId: string, updateState: any) => {
      const collections = getFromLocalStorage("collections") || []
      const updatedCollections = collections.map((collection: any) =>
        collection.id === itemId
          ? { ...collection, ...updateState }
          : collection
      )
      setInLocalStorage("collections", updatedCollections)
      return { ...item, ...updateState }
    },
    assistants: (itemId: string, updateState: any) => {
      const assistants = getFromLocalStorage("assistants") || []
      const updatedAssistants = assistants.map((assistant: any) =>
        assistant.id === itemId ? { ...assistant, ...updateState } : assistant
      )
      setInLocalStorage("assistants", updatedAssistants)
      return { ...item, ...updateState }
    },
    tools: (itemId: string, updateState: any) => {
      const tools = getFromLocalStorage("tools") || []
      const updatedTools = tools.map((tool: any) =>
        tool.id === itemId ? { ...tool, ...updateState } : tool
      )
      setInLocalStorage("tools", updatedTools)
      return { ...item, ...updateState }
    },
    models: (itemId: string, updateState: any) => {
      const models = getFromLocalStorage("models") || []
      const updatedModels = models.map((model: any) =>
        model.id === itemId ? { ...model, ...updateState } : model
      )
      setInLocalStorage("models", updatedModels)
      return { ...item, ...updateState }
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

  const handleUpdate = async () => {
    try {
      const updateFunction = updateFunctions[contentType]
      const setStateFunction = stateUpdateFunctions[contentType]

      if (!updateFunction || !setStateFunction) return
      if (isTyping) return // Prevent update while typing

      const updatedItem = await updateFunction(item.id, updateState)

      setStateFunction((prevItems: any) =>
        prevItems.map((prevItem: any) =>
          prevItem.id === item.id ? updatedItem : prevItem
        )
      )

      setIsOpen(false)

      toast.success(`${contentType.slice(0, -1)} updated successfully`)
    } catch (error) {
      toast.error(`Error updating ${contentType.slice(0, -1)}. ${error}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isTyping && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      buttonRef.current?.click()
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>

      <SheetContent
        className="flex min-w-[450px] flex-col justify-between"
        side="left"
        onKeyDown={handleKeyDown}
      >
        <div className="grow overflow-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold">
              Edit {contentType.slice(0, -1)}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-3">{renderInputs(null)}</div>
        </div>

        <SheetFooter className="mt-2 flex justify-between">
          <SidebarDeleteItem item={item} contentType={contentType} />

          <div className="flex grow justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>

            <Button ref={buttonRef} onClick={handleUpdate}>
              Save
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
