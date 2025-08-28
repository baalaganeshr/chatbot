"use client"

import { ChatbotUIContext } from "@/context/context"
import { FC, useContext, useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

interface OllamaManageModelsProps {}

export const OllamaManageModels: FC<OllamaManageModelsProps> = ({}) => {
  const { availableLocalModels, setAvailableLocalModels } =
    useContext(ChatbotUIContext)
  const [modelName, setModelName] = useState("")
  const [pullStatus, setPullStatus] = useState("")
  const [isPulling, setIsPulling] = useState(false)

  const handlePullModel = async () => {
    if (!modelName) return

    setIsPulling(true)
    setPullStatus("")

    try {
      const response = await fetch("/api/chat/ollama/pull", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ model: modelName })
      })

      if (!response.body) {
        throw new Error("No response body")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }
        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")
        for (const line of lines) {
          if (line) {
            const parsed = JSON.parse(line)
            setPullStatus(parsed.status)
          }
        }
      }

      setIsPulling(false)
      setPullStatus("Model pulled successfully!")
      // TODO: refresh model list
    } catch (error: any) {
      setIsPulling(false)
      setPullStatus(`Error: ${error.message}`)
    }
  }

  const handleDeleteModel = async (modelId: string) => {
    try {
      await fetch("/api/chat/ollama/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ model: modelId })
      })

      setAvailableLocalModels(
        availableLocalModels.filter(model => model.modelId !== modelId)
      )
    } catch (error) {
      console.error("Failed to delete model", error)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 font-semibold">Pull a new model</div>
        <div className="space-y-2">
          <Input
            placeholder="Enter model name (e.g. llama2)"
            value={modelName}
            onChange={e => setModelName(e.target.value)}
          />
          <Button onClick={handlePullModel} disabled={isPulling || !modelName}>
            {isPulling ? "Pulling..." : "Pull Model"}
          </Button>

          {pullStatus && <div className="text-sm">{pullStatus}</div>}
        </div>
      </div>

      <div>
        <div className="mb-2 font-semibold">Local Models</div>
        <div className="space-y-2">
          {availableLocalModels.map(model => (
            <div
              key={model.modelId}
              className="flex items-center justify-between"
            >
              <div>{model.modelName}</div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteModel(model.modelId)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
