import React from 'react';
import { MousePointer2, Square, Circle, Type, Hand } from 'lucide-react';
import { useEditorStore, Tool } from '@/store/editor-store';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
const tools = [
  { id: 'select', icon: MousePointer2, label: 'Select (V)' },
  { id: 'rect', icon: Square, label: 'Rectangle (R)' },
  { id: 'circle', icon: Circle, label: 'Circle (O)' },
  { id: 'text', icon: Type, label: 'Text (T)' },
  { id: 'hand', icon: Hand, label: 'Hand (H)' },
] as const;
export function Toolbar() {
  const currentTool = useEditorStore((s) => s.currentTool);
  const setTool = useEditorStore((s) => s.setTool);
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl">
        <TooltipProvider delayDuration={300}>
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "w-10 h-10 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors",
                    currentTool === tool.id && "bg-blue-600 text-white hover:bg-blue-600"
                  )}
                  onClick={() => setTool(tool.id as Tool)}
                >
                  <tool.icon className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-zinc-950 border-zinc-800 text-white">
                {tool.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}