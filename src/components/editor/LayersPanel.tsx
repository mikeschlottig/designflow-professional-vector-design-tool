import React from 'react';
import { Square, Circle, Type, Eye, Lock, GripVertical } from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
import { ElementType, CanvasElement } from '@shared/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
const TypeIcon = ({ type }: { type: ElementType }) => {
  switch (type) {
    case 'rect': return <Square className="w-3.5 h-3.5" />;
    case 'circle': return <Circle className="w-3.5 h-3.5" />;
    case 'text': return <Type className="w-3.5 h-3.5" />;
    default: return null;
  }
};
function SortableLayerItem({ el }: { el: CanvasElement }) {
  const isSelected = useEditorStore((s) => s.selectedIds.includes(el.id));
  const setSelection = useEditorStore((s) => s.setSelection);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: el.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => setSelection(el.id)}
      className={cn(
        "group flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-default transition-all",
        isSelected
          ? "bg-primary/10 text-primary border border-primary/30"
          : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent",
        isDragging && "opacity-50 scale-[0.98] shadow-xl border-border bg-muted"
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-3 h-3 text-muted-foreground hover:text-foreground" />
      </div>
      <TypeIcon type={el.type} />
      <span className="flex-1 truncate text-[11px] font-medium">
        {el.name}
      </span>
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Eye className="w-3 h-3 text-muted-foreground hover:text-foreground" />
        <Lock className="w-3 h-3 text-muted-foreground hover:text-foreground" />
      </div>
    </div>
  );
}
export function LayersPanel() {
  const elements = useEditorStore((s) => s.elements);
  const setElements = useEditorStore((s) => s.setElements);
  const saveHistory = useEditorStore((s) => s.saveHistory);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      saveHistory();
      const oldIndex = elements.findIndex((el) => el.id === active.id);
      const newIndex = elements.findIndex((el) => el.id === over.id);
      // Visual list is reversed (top layer first), so swap indices for correct Z-order
      setElements(arrayMove(elements, oldIndex, elements.length - 1 - newIndex));
    }
  };
  // Visual list is reversed so the "top" layer is at the top of the list
  const displayElements = [...elements].reverse();
  return (
    <div className="w-60 border-r border-border bg-background flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Layers</h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {elements.length === 0 ? (
            <div className="px-4 py-8 text-center text-[11px] text-muted-foreground italic">
              Empty Canvas
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={elements.map(el => el.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-0.5">
                  {displayElements.map((el) => (
                    <SortableLayerItem key={el.id} el={el} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}