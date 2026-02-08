import React from 'react';
import { useEditorStore } from '@/store/editor-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, AlignVerticalJustifyCenter, Maximize } from 'lucide-react';
const COLORS = [
  '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', 
  '#18181b', '#3f3f46', '#71717a', '#ffffff'
];
export function PropertiesPanel() {
  const elements = useEditorStore((s) => s.elements);
  const selectedId = useEditorStore((s) => s.selectedId);
  const updateElement = useEditorStore((s) => s.updateElement);
  const saveHistory = useEditorStore((s) => s.saveHistory);
  const selected = elements.find((el) => el.id === selectedId);
  if (!selected) {
    return (
      <div className="w-72 border-l border-zinc-800 bg-zinc-950 p-6 h-full flex flex-col items-center justify-center text-zinc-600 italic text-[11px] text-center">
        Select an element on the canvas to edit its properties
      </div>
    );
  }
  const handleChange = (key: string, value: any) => {
    updateElement(selected.id, { [key]: value });
  };
  const centerOnCanvas = () => {
    saveHistory();
    updateElement(selected.id, { x: 500 - (selected.width / 2), y: 400 - (selected.height / 2) });
  };
  return (
    <div className="w-72 border-l border-zinc-800 bg-zinc-950 p-4 h-full overflow-y-auto space-y-6">
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Alignment</h3>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8 bg-zinc-900 border-zinc-800" onClick={centerOnCanvas}>
            <Maximize className="w-3.5 h-3.5 text-zinc-400" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 bg-zinc-900 border-zinc-800">
            <AlignLeft className="w-3.5 h-3.5 text-zinc-400" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 bg-zinc-900 border-zinc-800">
            <AlignCenter className="w-3.5 h-3.5 text-zinc-400" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 bg-zinc-900 border-zinc-800">
            <AlignVerticalJustifyCenter className="w-3.5 h-3.5 text-zinc-400" />
          </Button>
        </div>
      </div>
      <Separator className="bg-zinc-900" />
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Layout</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] text-zinc-500">X</Label>
            <Input
              type="number"
              value={Math.round(selected.x)}
              onFocus={saveHistory}
              onChange={(e) => handleChange('x', Number(e.target.value))}
              className="h-8 bg-zinc-900 border-zinc-800 text-[11px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-zinc-500">Y</Label>
            <Input
              type="number"
              value={Math.round(selected.y)}
              onFocus={saveHistory}
              onChange={(e) => handleChange('y', Number(e.target.value))}
              className="h-8 bg-zinc-900 border-zinc-800 text-[11px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-zinc-500">Width</Label>
            <Input
              type="number"
              value={Math.round(selected.width)}
              onFocus={saveHistory}
              onChange={(e) => handleChange('width', Math.max(1, Number(e.target.value)))}
              className="h-8 bg-zinc-900 border-zinc-800 text-[11px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-zinc-500">Height</Label>
            <Input
              type="number"
              value={Math.round(selected.height)}
              onFocus={saveHistory}
              onChange={(e) => handleChange('height', Math.max(1, Number(e.target.value)))}
              className="h-8 bg-zinc-900 border-zinc-800 text-[11px]"
            />
          </div>
        </div>
      </div>
      <Separator className="bg-zinc-900" />
      {selected.type === 'text' && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Content</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] text-zinc-500">Text</Label>
              <Textarea
                value={selected.text}
                onFocus={saveHistory}
                onChange={(e) => handleChange('text', e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-[11px] min-h-[60px] resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] text-zinc-500">Font Size</Label>
              <Input
                type="number"
                value={selected.fontSize || 16}
                onFocus={saveHistory}
                onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                className="h-8 bg-zinc-900 border-zinc-800 text-[11px]"
              />
            </div>
          </div>
          <Separator className="bg-zinc-900" />
        </div>
      )}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Fill</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div
              className="w-10 h-10 rounded-md border border-zinc-800 shrink-0 shadow-inner"
              style={{ backgroundColor: selected.fill }}
            />
            <Input
              value={selected.fill}
              onFocus={saveHistory}
              onChange={(e) => handleChange('fill', e.target.value)}
              className="h-10 bg-zinc-900 border-zinc-800 text-[11px] font-mono"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {COLORS.map(color => (
              <button
                key={color}
                onClick={() => { saveHistory(); handleChange('fill', color); }}
                className="w-5 h-5 rounded-full border border-zinc-800 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
      {selected.type !== 'text' && (
        <div className="space-y-4 pt-2">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Stroke</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <div
                className="w-8 h-8 rounded border border-zinc-800 shrink-0"
                style={{ backgroundColor: selected.stroke }}
              />
              <Input
                value={selected.stroke}
                onFocus={saveHistory}
                onChange={(e) => handleChange('stroke', e.target.value)}
                className="h-8 bg-zinc-900 border-zinc-800 text-[11px] font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] text-zinc-500">Stroke Weight</Label>
              <Input
                type="number"
                value={selected.strokeWidth}
                onFocus={saveHistory}
                onChange={(e) => handleChange('strokeWidth', Number(e.target.value))}
                className="h-8 bg-zinc-900 border-zinc-800 text-[11px]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}