import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatbotUIContext } from "@/context/context"
import { cn } from "@/lib/utils"
import { Tables } from "@/supabase/types"
import { ChatMessage } from "@/types"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { Button } from "../ui/button"
import { MessageHeader } from "./content/message-header"
import { MessageContent } from "./content/message-content"
import { MessageActionsBar } from "./content/message-actions-bar"
import { IconAlertTriangle } from "@tabler/icons-react"
import { WithTooltip } from "../ui/with-tooltip"

interface MessageProps {
  chatMessage: ChatMessage
  fileItems: Tables<"file_items">[]
  isEditing: boolean
  isLast: boolean
  onStartEdit: (chatMessage: ChatMessage) => void
  onCancelEdit: () => void
  onSubmitEdit: (value: string, sequenceNumber: number) => void
}

export const Message: FC<MessageProps> = ({
  chatMessage,
  fileItems,
  isEditing,
  isLast,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit
}) => {
  const { setIsGenerating, chatMessages } = useContext(ChatbotUIContext)
  const { handleSendMessage } = useChatHandler()
  const editInputRef = useRef<HTMLTextAreaElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [editedMessage, setEditedMessage] = useState(
    chatMessage.message.content
  )

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(chatMessage.message.content)
    } else {
      const textArea = document.createElement("textarea")
      textArea.value = chatMessage.message.content
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
    }
  }

  const handleSendEdit = () => {
    onSubmitEdit(editedMessage, chatMessage.message.sequence_number)
    onCancelEdit()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isEditing && event.key === "Enter" && event.metaKey) {
      handleSendEdit()
    }
  }

  const handleRegenerate = async () => {
    setIsGenerating(true)
    await handleSendMessage(
      editedMessage || chatMessages[chatMessages.length - 2].message.content,
      chatMessages,
      true
    )
  }

  const handleStartEdit = () => {
    onStartEdit(chatMessage)
  }

  useEffect(() => {
    setEditedMessage(chatMessage.message.content)

    if (isEditing && editInputRef.current) {
      const input = editInputRef.current
      input.focus()
      input.setSelectionRange(input.value.length, input.value.length)
    }
  }, [isEditing])

  return (
    <div
      className={cn(
        "flex w-full justify-center",
        chatMessage.message.role === "user" ? "" : "bg-secondary"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onKeyDown={handleKeyDown}
    >
      <div className="relative flex w-full flex-col p-7 sm:w-[550px] sm:px-0 md:w-[650px] lg:w-[650px] xl:w-[700px]">
        <MessageActionsBar
          message={chatMessage.message}
          isLast={isLast}
          isEditing={isEditing}
          isHovering={isHovering}
          onCopy={handleCopy}
          onEdit={handleStartEdit}
          onRegenerate={handleRegenerate}
        />

        <div className="space-y-3">
          <MessageHeader message={chatMessage.message} />
          <MessageContent
            message={chatMessage.message}
            fileItems={fileItems}
            isEditing={isEditing}
            isLast={isLast}
            editedMessage={editedMessage}
            setEditedMessage={setEditedMessage}
            editInputRef={editInputRef}
          />
          {chatMessage.status === "error" && (
            <WithTooltip
              display={<div>{chatMessage.error}</div>}
              trigger={<IconAlertTriangle className="text-red-500" size={20} />}
            />
          )}
        </div>

        {isEditing && (
          <div className="mt-4 flex justify-center space-x-2">
            <Button size="sm" onClick={handleSendEdit}>
              Save & Send
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelEdit}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
