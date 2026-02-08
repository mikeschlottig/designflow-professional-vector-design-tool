import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Canvas } from '@/components/editor/Canvas';
import { Toolbar } from '@/components/editor/Toolbar';
import { LayersPanel } from '@/components/editor/LayersPanel';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  Share2,
  Play,
  Cloud,
  CloudOff,
  Loader2,
  Download,
  Plus,
  ChevronDown,
  EyeOff
} from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
import { api } from '@/lib/api-client';
import { Design } from '@shared/types';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const loadDesign = useEditorStore((s) => s.loadDesign);
  const designName = useEditorStore((s) => s.designName);
  const isSaving = useEditorStore((s) => s.isSaving);
  const isDirty = useEditorStore((s) => s.isDirty);
  const designId = useEditorStore((s) => s.designId);
  const presentationMode = useEditorStore((s) => s.presentationMode);
  const togglePresentationMode = useEditorStore((s) => s.togglePresentationMode);
  useEffect(() => {
    if (id) loadDesign(id);
  }, [id, loadDesign]);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        togglePresentationMode();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [togglePresentationMode]);
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Editor link copied to clipboard');
  };
  const handleExportSVG = () => {
    const svgElement = document.getElementById('canvas-svg');
    if (!svgElement) return;
    const clone = svgElement.cloneNode(true) as SVGSVGElement;
    clone.querySelectorAll('.selection-overlay').forEach(o => o.remove());
    const svgData = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${designName}.svg`;
    link.click();
    toast.success('SVG exported');
  };
  if (id && !designId) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-zinc-500 text-sm">Syncing with cloud...</p>
      </div>
    );
  }
  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
      <header className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 bg-zinc-950/80 backdrop-blur z-50">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="h-4 w-px bg-zinc-800" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-7 px-2 text-sm gap-1.5">
                <span className="truncate max-w-[120px]">{designName}</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
              <DropdownMenuItem onClick={handleExportSVG}>
                <Download className="w-4 h-4 mr-2" /> Export SVG
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem onClick={() => navigate('/')}>Exit to Dashboard</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="mr-4">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-zinc-500" /> : <Cloud className="w-4 h-4 text-blue-500" />}
                </div>
              </TooltipTrigger>
              <TooltipContent>{isSaving ? 'Saving...' : 'All changes saved'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="ghost" size="sm" onClick={togglePresentationMode} className="h-8 text-xs gap-2">
            {presentationMode ? <EyeOff className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {presentationMode ? 'Editor' : 'Present'}
          </Button>
          <Button size="sm" onClick={handleShare} className="h-8 bg-blue-600 text-xs px-4">
            <Share2 className="w-3.5 h-3.5 mr-2" /> Share
          </Button>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence>
          {!presentationMode && (
            <motion.div initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
              <LayersPanel />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex-1 relative flex flex-col">
          <Canvas />
          {!presentationMode && <Toolbar />}
          {presentationMode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-zinc-900/80 border border-zinc-800 rounded-full px-4 py-2 text-[10px] text-zinc-400">
              Presentation Mode • Press <kbd className="bg-zinc-800 px-1 rounded">Esc</kbd> or <kbd className="bg-zinc-800 px-1 rounded">⌘P</kbd> to exit
            </div>
          )}
        </div>
        <AnimatePresence>
          {!presentationMode && (
            <motion.div initial={{ x: 280 }} animate={{ x: 0 }} exit={{ x: 280 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
              <PropertiesPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}