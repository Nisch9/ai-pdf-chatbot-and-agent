'use client';

import { Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'groq/llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B',
    provider: 'Groq',
    description: 'Best quality, great for PDF analysis',
    icon: <Zap className="w-4 h-4" />,
    color: 'text-yellow-400',
  },
  {
    id: 'groq/llama-3.1-8b-instant',
    name: 'Llama 3.1 8B',
    provider: 'Groq',
    description: 'Fast but limited PDF support - use for general questions',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'text-blue-400',
  },
];

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

export function ModelSelector({ selectedModel, onSelectModel }: ModelSelectorProps) {
  const currentModel = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 text-slate-300"
        >
          <span className={currentModel.color}>{currentModel.icon}</span>
          <span className="hidden sm:inline">{currentModel.name}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="text-xs text-slate-400">
          Select Model
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {AVAILABLE_MODELS.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onSelectModel(model.id)}
            className={`flex items-start gap-3 p-3 cursor-pointer ${
              selectedModel === model.id ? 'bg-slate-800' : ''
            }`}
          >
            <div className={`mt-0.5 ${model.color}`}>{model.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{model.name}</span>
                <span className="text-xs text-slate-500 px-1.5 py-0.5 rounded bg-slate-800">
                  {model.provider}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{model.description}</p>
            </div>
            {selectedModel === model.id && (
              <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
