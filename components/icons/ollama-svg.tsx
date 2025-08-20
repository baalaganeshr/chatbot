import { FC } from "react"

interface OllamaSVGProps {
  width?: number
  height?: number
}

export const OllamaSVG: FC<OllamaSVGProps> = ({ width = 32, height = 32 }) => {
  return (
    <image
      href="/providers/ollama.png"
      width={width}
      height={height}
      alt="Ollama"
    />
  )
}
