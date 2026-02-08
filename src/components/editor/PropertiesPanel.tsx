import React from 'react';
import { useEditorStore } from '@/store/editor-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Maximize, Copy, Hash } from 'lucide-react';
import { toast } from 'sonner';
const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#18181b', '#ffffff'];
export function PropertiesPanel() {
  const elements = useEditorStore((s) => s.elements);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const updateElement = useEditorStore((s) => s.updateElement);
  const saveHistory = useEditorStore((s) => s.saveHistory);
  const selectedElements = elements.filter(el => selectedIds.includes(el.id));
  const isSingle = selectedElements.length === 1;
  const isMultiple = selectedElements.length > 1;
  if (selectedElements.length === 0) {
    return (
      <div className="w-72 border-l border-zinc-800 bg-zinc-950 p-6 h-full flex flex-col items-center justify-center text-zinc-600 italic text-[11px] text-center">
        Select elements to edit properties
      </div>
    );
  }
  const handleBulkUpdate = (key: string, value: any) => {
    saveHistory();
    selectedIds.forEach(id => updateElement(id, { [key]: value }));
  };
  const copyId = () => {
    if (isSingle) {
      navigator.clipboard.writeText(selectedElements[0].id);
      toast.success('ID copied to clipboard');
    }
  };
  return (
    <div className="w-72 border-l border-zinc-800 bg-zinc-950 p-4 h-full overflow-y-auto space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          {isMultiple ? `${selectedElements.length} Elements` : selectedElements[0].name}
        </h3>
        {isSingle && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyId}>
            <Hash className="w-3 h-3 text-zinc-600" />
          </Button>
        )}
      </div>
      {isSingle && (
        <>
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Layout</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {[
                { label: 'X', key: 'x' },
                { label: 'Y', key: 'y' },
                { label: 'Width', key: 'width' },
                { label: 'Height', key: 'height' },
              ].map(p => (
                <div key={p.key} className="space-y-1.5">
                  <Label className="text-[10px] text-zinc-500">{p.label}</Label>
                  <Input
                    type="number"
                    value={Math.round(selectedElements[0][p.key as keyof typeof selectedElements[0]] as number)}
                    onChange={(e) => updateElement(selectedElements[0].id, { [p.key]: Number(e.target.value) })}
                    className="h-8 bg-zinc-900 border-zinc-800 text-[11px]"
                  />
                </div>
              ))}
            </div>
          </div>
          <Separator className="bg-zinc-900" />
        </>
      )}
      {isSingle && selectedElements[0].type === 'text' && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Text</h3>
          <div className="space-y-3">
            <Textarea
              value={selectedElements[0].text}
              onChange={(e) => updateElement(selectedElements[0].id, { text: e.target.value })}
              className="bg-zinc-900 border-zinc-800 text-[11px] min-h-[60px] resize-none"
            />
            <div className="space-y-1.5">
              <Label className="text-[10px] text-zinc-500">Font Size</Label>
              <Input
                type="number"
                value={selectedElements[0].fontSize || 16}
                onChange={(e) => updateElement(selectedElements[0].id, { fontSize: Number(e.target.value) })}
                className="h-8 bg-zinc-900 border-zinc-800 text-[11px]"
              />
            </div>
          </div>
          <Separator className="bg-zinc-900" />
        </div>
      )}
      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Style</h3>
        <div className="space-y-3">
          <Label className="text-[10px] text-zinc-500">Fill</Label>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {COLORS.map(color => (
              <button
                key={color}
                onClick={() => handleBulkUpdate('fill', color)}
                className="w-6 h-6 rounded-full border border-zinc-800 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <Input
            value={isSingle ? selectedElements[0].fill : ''}
            placeholder={isMultiple ? "Mixed" : "#000000"}
            onChange={(e) => handleBulkUpdate('fill', e.target.value)}
            className="h-8 bg-zinc-900 border-zinc-800 text-[11px] font-mono"
          />
        </div>
      </div>
      <div className="pt-4 opacity-50 text-center">
        <p className="text-[10px] text-zinc-600">Pro Tip: Use Shift + Click for multi-selection</p>
      </div>
    </div>
  );
}