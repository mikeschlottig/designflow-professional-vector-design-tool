import React from 'react';
import { useEditorStore } from '@/store/editor-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
export function PropertiesPanel() {
  const elements = useEditorStore((s) => s.elements);
  const selectedId = useEditorStore((s) => s.selectedId);
  const updateElement = useEditorStore((s) => s.updateElement);
  const selected = elements.find((el) => el.id === selectedId);
  if (!selected) {
    return (
      <div className="w-72 border-l border-zinc-800 bg-zinc-950 p-4 h-full flex flex-col items-center justify-center text-zinc-500 italic text-sm">
        Select an element to edit properties
      </div>
    );
  }
  const handleChange = (key: string, value: any) => {
    updateElement(selected.id, { [key]: value });
  };
  return (
    <div className="w-72 border-l border-zinc-800 bg-zinc-950 p-4 h-full overflow-y-auto space-y-6">
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Layout</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] text-zinc-500 uppercase">X</Label>
            <Input
              type="number"
              value={Math.round(selected.x)}
              onChange={(e) => handleChange('x', Number(e.target.value))}
              className="h-8 bg-zinc-900 border-zinc-800 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-zinc-500 uppercase">Y</Label>
            <Input
              type="number"
              value={Math.round(selected.y)}
              onChange={(e) => handleChange('y', Number(e.target.value))}
              className="h-8 bg-zinc-900 border-zinc-800 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-zinc-500 uppercase">W</Label>
            <Input
              type="number"
              value={Math.round(selected.width)}
              onChange={(e) => handleChange('width', Number(e.target.value))}
              className="h-8 bg-zinc-900 border-zinc-800 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-zinc-500 uppercase">H</Label>
            <Input
              type="number"
              value={Math.round(selected.height)}
              onChange={(e) => handleChange('height', Number(e.target.value))}
              className="h-8 bg-zinc-900 border-zinc-800 text-xs"
            />
          </div>
        </div>
      </div>
      <Separator className="bg-zinc-800" />
      {selected.type === 'text' && (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Text</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] text-zinc-500 uppercase">Content</Label>
              <Textarea
                value={selected.text}
                onChange={(e) => handleChange('text', e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-xs min-h-[60px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] text-zinc-500 uppercase">Size</Label>
              <Input
                type="number"
                value={selected.fontSize || 16}
                onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                className="h-8 bg-zinc-900 border-zinc-800 text-xs"
              />
            </div>
          </div>
          <Separator className="bg-zinc-800" />
        </div>
      )}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Appearance</h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] text-zinc-500 uppercase">Fill / Color</Label>
            <div className="flex gap-2">
              <div
                className="w-8 h-8 rounded border border-zinc-700 shrink-0"
                style={{ backgroundColor: selected.fill }}
              />
              <Input
                value={selected.fill}
                onChange={(e) => handleChange('fill', e.target.value)}
                className="h-8 bg-zinc-900 border-zinc-800 text-xs font-mono"
              />
            </div>
          </div>
          {selected.type !== 'text' && (
            <div className="space-y-1.5">
              <Label className="text-[10px] text-zinc-500 uppercase">Stroke</Label>
              <div className="flex gap-2">
                <div
                  className="w-8 h-8 rounded border border-zinc-700 shrink-0"
                  style={{ backgroundColor: selected.stroke }}
                />
                <Input
                  value={selected.stroke}
                  onChange={(e) => handleChange('stroke', e.target.value)}
                  className="h-8 bg-zinc-900 border-zinc-800 text-xs font-mono"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}