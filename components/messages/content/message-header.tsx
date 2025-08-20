import { ChatbotUIContext } from "@/context/context"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { Tables } from "@/supabase/types"
import { LLM, LLMID, ModelProvider } from "@/types"
import { IconMoodSmile, IconPencil } from "@tabler/icons-react"
import Image from "next/image"
import { FC, useContext } from "react"
import { ModelIcon } from "../../models/model-icon"
import { WithTooltip } from "../../ui/with-tooltip"

interface MessageHeaderProps {
  message: Tables<"messages">
}

const ICON_SIZE = 32

export const MessageHeader: FC<MessageHeaderProps> = ({ message }) => {
  const { assistants, profile, selectedAssistant, assistantImages, models } =
    useContext(ChatbotUIContext)

  const MODEL_DATA = [
    ...models.map(model => ({
      modelId: model.model_id as LLMID,
      modelName: model.name,
      provider: "custom" as ModelProvider,
      hostedId: model.id,
      platformLink: "",
      imageInput: false
    })),
    ...LLM_LIST
  ].find(llm => llm.modelId === message.model) as LLM

  const messageAssistantImage = assistantImages.find(
    image => image.assistantId === message.assistant_id
  )?.base64

  const modelDetails = LLM_LIST.find(model => model.modelId === message.model)

  if (message.role === "system") {
    return (
      <div className="flex items-center space-x-4">
        <IconPencil
          className="border-primary bg-primary text-secondary rounded border-DEFAULT p-1"
          size={ICON_SIZE}
        />
        <div className="text-lg font-semibold">Prompt</div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      {message.role === "assistant" ? (
        messageAssistantImage ? (
          <Image
            style={{
              width: `${ICON_SIZE}px`,
              height: `${ICON_SIZE}px`
            }}
            className="rounded"
            src={messageAssistantImage}
            alt="assistant image"
            height={ICON_SIZE}
            width={ICON_SIZE}
          />
        ) : (
          <WithTooltip
            display={<div>{MODEL_DATA?.modelName}</div>}
            trigger={
              <ModelIcon
                provider={modelDetails?.provider || "custom"}
                height={ICON_SIZE}
                width={ICON_SIZE}
              />
            }
          />
        )
      ) : profile?.image_url ? (
        <Image
          className={`size-[32px] rounded`}
          src={profile.image_url}
          height={32}
          width={32}
          alt="user image"
        />
      ) : (
        <IconMoodSmile
          className="bg-primary text-secondary border-primary rounded border-DEFAULT p-1"
          size={ICON_SIZE}
        />
      )}
      <div className="font-semibold">
        {message.role === "assistant"
          ? ""
          : profile?.display_name ?? profile?.username}
      </div>
    </div>
  )
}
