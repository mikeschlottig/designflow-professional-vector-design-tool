import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Canvas } from '@/components/editor/Canvas';
import { Toolbar } from '@/components/editor/Toolbar';
import { LayersPanel } from '@/components/editor/LayersPanel';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Share2, Play, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const loadDesign = useEditorStore((s) => s.loadDesign);
  const designName = useEditorStore((s) => s.designName);
  const setDesignName = useEditorStore((s) => s.setDesignName);
  const isSaving = useEditorStore((s) => s.isSaving);
  const isDirty = useEditorStore((s) => s.isDirty);
  const designId = useEditorStore((s) => s.designId);
  useEffect(() => {
    if (id) {
      loadDesign(id);
    }
  }, [id, loadDesign]);
  if (id && !designId) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }
  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
      <header className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-2">
            <Input
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="h-7 w-48 bg-transparent border-none focus-visible:ring-1 focus-visible:ring-zinc-700 text-sm font-medium px-2"
            />
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
            ) : isDirty ? (
              <CloudOff className="w-3.5 h-3.5 text-zinc-500" title="Unsaved changes" />
            ) : (
              <Cloud className="w-3.5 h-3.5 text-blue-500" title="All changes saved" />
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-2">
            <Play className="w-3.5 h-3.5" /> Present
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Share2 className="w-3.5 h-3.5" /> Share
          </Button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border border-zinc-800" />
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <LayersPanel />
        <div className="flex-1 relative">
          <Canvas />
          <Toolbar />
        </div>
        <PropertiesPanel />
      </div>
    </div>
  );
}