import React from 'react';
import { MousePointer2, Square, Circle, Type, Hand, Undo2, Redo2 } from 'lucide-react';
import { useEditorStore, Tool } from '@/store/editor-store';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
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
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const past = useEditorStore((s) => s.past);
  const future = useEditorStore((s) => s.future);
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1.5 p-1.5 bg-card border border-card rounded-xl shadow-2xl backdrop-blur-lg">
        <TooltipProvider delayDuration={300}>
          <div className="flex items-center gap-1">
            {tools.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted transition-all rounded-lg",
                      currentTool === tool.id && "bg-primary text-primary-foreground hover:bg-primary shadow-lg shadow-primary/20"
                    )}
                    onClick={() => setTool(tool.id as Tool)}
                  >
                    <tool.icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px]">
                  {tool.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted transition-all rounded-lg disabled:opacity-20"
                  onClick={undo}
                  disabled={past.length === 0}
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10px]">
                Undo (Ctrl+Z)
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted transition-all rounded-lg disabled:opacity-20"
                  onClick={redo}
                  disabled={future.length === 0}
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10px]">
                Redo (Ctrl+Shift+Z)
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}