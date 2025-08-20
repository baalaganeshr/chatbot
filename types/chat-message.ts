import { Tables } from "@/supabase/types"

export type MessageStatus = "sending" | "sent" | "error" | "delivered"

export interface ChatMessage {
  message: Tables<"messages">
  fileItems: string[]
  status?: MessageStatus
  error?: string
}
