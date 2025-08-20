import { FC, useContext, useState } from "react"
import { Tables } from "@/supabase/types"
import { ChatbotUIContext } from "@/context/context"
import { MessageMarkdown } from "../message-markdown"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import {
  IconBolt,
  IconCircleFilled,
  IconFileText,
  IconCaretRightFilled,
  IconCaretDownFilled
} from "@tabler/icons-react"
import Image from "next/image"
import { FileIcon } from "@/components/ui/file-icon"
import { FilePreview } from "@/components/ui/file-preview"
import { MessageImage } from "@/types"

interface MessageContentProps {
  message: Tables<"messages">
  fileItems: Tables<"file_items">[]
  isEditing: boolean
  isLast: boolean
  editedMessage: string
  setEditedMessage: (value: string) => void
  editInputRef: React.RefObject<HTMLTextAreaElement>
}

export const MessageContent: FC<MessageContentProps> = ({
  message,
  fileItems,
  isEditing,
  isLast,
  editedMessage,
  setEditedMessage,
  editInputRef
}) => {
  const { isGenerating, firstTokenReceived, toolInUse, files, chatImages } =
    useContext(ChatbotUIContext)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [selectedImage, setSelectedImage] = useState<MessageImage | null>(null)
  const [showFileItemPreview, setShowFileItemPreview] = useState(false)
  const [selectedFileItem, setSelectedFileItem] =
    useState<Tables<"file_items"> | null>(null)
  const [viewSources, setViewSources] = useState(false)

  const fileAccumulator: Record<
    string,
    {
      id: string
      name: string
      count: number
      type: string
      description: string
    }
  > = {}

  const fileSummary = fileItems.reduce((acc, fileItem) => {
    const parentFile = files.find(file => file.id === fileItem.file_id)
    if (parentFile) {
      if (!acc[parentFile.id]) {
        acc[parentFile.id] = {
          id: parentFile.id,
          name: parentFile.name,
          count: 1,
          type: parentFile.type,
          description: parentFile.description
        }
      } else {
        acc[parentFile.id].count += 1
      }
    }
    return acc
  }, fileAccumulator)

  return (
    <div className="space-y-3">
      {!firstTokenReceived &&
      isGenerating &&
      isLast &&
      message.role === "assistant" ? (
        <>
          {(() => {
            switch (toolInUse) {
              case "none":
                return <IconCircleFilled className="animate-pulse" size={20} />
              case "retrieval":
                return (
                  <div className="flex animate-pulse items-center space-x-2">
                    <IconFileText size={20} />
                    <div>Searching files...</div>
                  </div>
                )
              default:
                return (
                  <div className="flex animate-pulse items-center space-x-2">
                    <IconBolt size={20} />
                    <div>Using {toolInUse}...</div>
                  </div>
                )
            }
          })()}
        </>
      ) : isEditing ? (
        <TextareaAutosize
          textareaRef={editInputRef}
          className="text-md"
          value={editedMessage}
          onValueChange={setEditedMessage}
          maxRows={20}
        />
      ) : (
        <MessageMarkdown content={message.content} />
      )}

      {fileItems.length > 0 && (
        <div className="border-primary mt-6 border-t pt-4 font-bold">
          {!viewSources ? (
            <div
              className="flex cursor-pointer items-center text-lg hover:opacity-50"
              onClick={() => setViewSources(true)}
            >
              {fileItems.length}
              {fileItems.length > 1 ? " Sources " : " Source "}
              from {Object.keys(fileSummary).length}{" "}
              {Object.keys(fileSummary).length > 1 ? "Files" : "File"}{" "}
              <IconCaretRightFilled className="ml-1" />
            </div>
          ) : (
            <>
              <div
                className="flex cursor-pointer items-center text-lg hover:opacity-50"
                onClick={() => setViewSources(false)}
              >
                {fileItems.length}
                {fileItems.length > 1 ? " Sources " : " Source "}
                from {Object.keys(fileSummary).length}{" "}
                {Object.keys(fileSummary).length > 1 ? "Files" : "File"}{" "}
                <IconCaretDownFilled className="ml-1" />
              </div>

              <div className="mt-3 space-y-4">
                {Object.values(fileSummary).map((file, index) => (
                  <div key={index}>
                    <div className="flex items-center space-x-2">
                      <div>
                        <FileIcon type={file.type} />
                      </div>
                      <div className="truncate">{file.name}</div>
                    </div>
                    {fileItems
                      .filter(fileItem => {
                        const parentFile = files.find(
                          parentFile => parentFile.id === fileItem.file_id
                        )
                        return parentFile?.id === file.id
                      })
                      .map((fileItem, index) => (
                        <div
                          key={index}
                          className="ml-8 mt-1.5 flex cursor-pointer items-center space-x-2 hover:opacity-50"
                          onClick={() => {
                            setSelectedFileItem(fileItem)
                            setShowFileItemPreview(true)
                          }}
                        >
                          <div className="text-sm font-normal">
                            <span className="mr-1 text-lg font-bold">-</span>{" "}
                            {fileItem.content.substring(0, 200)}...
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {message.image_paths.map((path, index) => {
          const item = chatImages.find(image => image.path === path)
          return (
            <Image
              key={index}
              className="cursor-pointer rounded hover:opacity-50"
              src={path.startsWith("data") ? path : item?.base64}
              alt="message image"
              width={300}
              height={300}
              onClick={() => {
                setSelectedImage({
                  messageId: message.id,
                  path,
                  base64: path.startsWith("data") ? path : item?.base64 || "",
                  url: path.startsWith("data") ? "" : item?.url || "",
                  file: null
                })
                setShowImagePreview(true)
              }}
              loading="lazy"
            />
          )
        })}
      </div>

      {showImagePreview && selectedImage && (
        <FilePreview
          type="image"
          item={selectedImage}
          isOpen={showImagePreview}
          onOpenChange={isOpen => {
            setShowImagePreview(isOpen)
            setSelectedImage(null)
          }}
        />
      )}

      {showFileItemPreview && selectedFileItem && (
        <FilePreview
          type="file_item"
          item={selectedFileItem}
          isOpen={showFileItemPreview}
          onOpenChange={isOpen => {
            setShowFileItemPreview(isOpen)
            setSelectedFileItem(null)
          }}
        />
      )}
    </div>
  )
}
