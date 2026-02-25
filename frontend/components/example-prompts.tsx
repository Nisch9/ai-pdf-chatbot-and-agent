import { Card } from "@/components/ui/card"

interface ExamplePromptsProps {
  onPromptSelect: (prompt: string) => void
}

const EXAMPLE_PROMPTS = [
  {
    title: "What is this document about?",
  },
  {
    title: "What is music?",
  },
]

export function ExamplePrompts({ onPromptSelect }: ExamplePromptsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
      {EXAMPLE_PROMPTS.map((prompt, i) => (
        <Card 
          key={i} 
          className="glass-effect border border-slate-700/50 p-4 cursor-pointer hover:bg-slate-800/40 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 hover:scale-[1.02]"
          onClick={() => onPromptSelect(prompt.title)}
        >
          <p className="text-sm text-center font-medium text-slate-100">{prompt.title}</p>
        </Card>
      ))}
    </div>
  )
}

