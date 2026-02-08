import React from 'react';
import { Square, Circle, Type, Eye, Lock } from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
import { ElementType } from '@shared/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
const TypeIcon = ({ type }: { type: ElementType }) => {
  switch (type) {
    case 'rect': return <Square className="w-3.5 h-3.5" />;
    case 'circle': return <Circle className="w-3.5 h-3.5" />;
    case 'text': return <Type className="w-3.5 h-3.5" />;
    default: return null;
  }
};
export function LayersPanel() {
  const elements = useEditorStore((s) => s.elements);
  const selectedId = useEditorStore((s) => s.selectedId);
  const setSelection = useEditorStore((s) => s.setSelection);
  return (
    <div className="w-60 border-r border-zinc-800 bg-zinc-950 flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Layers</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-1 space-y-0.5">
          {elements.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-zinc-600">
              No layers yet
            </div>
          ) : (
            [...elements].reverse().map((el) => (
              <div
                key={el.id}
                onClick={() => setSelection(el.id)}
                className={cn(
                  "group flex items-center gap-2.5 px-3 py-2 rounded-md text-sm cursor-default transition-colors",
                  selectedId === el.id
                    ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                )}
              >
                <TypeIcon type={el.type} />
                <span className="flex-1 truncate text-xs font-medium">
                  {el.name}
                </span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-400" />
                  <Lock className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}