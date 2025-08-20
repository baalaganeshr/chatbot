import { FC } from "react"
import { Tables } from "@/supabase/types"
import { MessageActions } from "../message-actions"

interface MessageActionsBarProps {
  message: Tables<"messages">
  isLast: boolean
  isEditing: boolean
  isHovering: boolean
  onCopy: () => void
  onEdit: () => void
  onRegenerate: () => void
}

export const MessageActionsBar: FC<MessageActionsBarProps> = ({
  message,
  isLast,
  isEditing,
  isHovering,
  onCopy,
  onEdit,
  onRegenerate
}) => {
  return (
    <div className="absolute right-5 top-7 sm:right-0">
      <MessageActions
        onCopy={onCopy}
        onEdit={onEdit}
        isAssistant={message.role === "assistant"}
        isLast={isLast}
        isEditing={isEditing}
        isHovering={isHovering}
        onRegenerate={onRegenerate}
      />
    </div>
  )
}
