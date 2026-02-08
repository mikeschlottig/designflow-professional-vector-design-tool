import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Canvas } from '@/components/editor/Canvas';
import { Toolbar } from '@/components/editor/Toolbar';
import { LayersPanel } from '@/components/editor/LayersPanel';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  FileCode
} from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
import { api } from '@/lib/api-client';
import { Design } from '@shared/types';
import { toast } from 'sonner';
export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
  const handleCreateNew = async () => {
    try {
      const design = await api<Design>('/api/designs', {
        method: 'POST',
        body: JSON.stringify({ name: 'Untitled Design' }),
      });
      navigate(`/editor/${design.id}`);
    } catch (err) {
      toast.error('Failed to create new design');
    }
  };
  const handleExportSVG = () => {
    const svgElement = document.getElementById('canvas-svg');
    if (!svgElement) return;
    // Deep clone to avoid modifying active canvas
    const clone = svgElement.cloneNode(true) as SVGSVGElement;
    // Cleanup UI-only elements
    const overlays = clone.querySelectorAll('.selection-overlay');
    overlays.forEach(o => o.remove());
    // Export logic
    const svgData = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${designName || 'design'}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('SVG exported successfully');
  };
  if (id && !designId) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-zinc-500 text-sm">Synchronizing canvas...</p>
      </div>
    );
  }
  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
      <header className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 backdrop-blur-md bg-zinc-950/80 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-7 px-2 hover:bg-zinc-800 text-sm font-medium gap-1.5">
                  <span className="truncate max-w-[120px]">{designName}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                <DropdownMenuItem onClick={handleCreateNew}>
                  <Plus className="w-4 h-4 mr-2" /> New Design
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem onClick={handleExportSVG}>
                  <Download className="w-4 h-4 mr-2" /> Export as SVG
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <FileCode className="w-4 h-4 mr-2" /> Export as PNG (Soon)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help flex items-center">
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
                    ) : isDirty ? (
                      <CloudOff className="w-3.5 h-3.5 text-zinc-500" />
                    ) : (
                      <Cloud className="w-3.5 h-3.5 text-blue-500" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-zinc-900 border-zinc-800 text-[10px]">
                  {isSaving ? "Syncing..." : isDirty ? "Unsaved local changes" : "Canvas synced to Cloudflare"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 mr-4">
             {[1, 2].map(i => (
               <div key={i} className="w-7 h-7 rounded-full border-2 border-zinc-950 bg-zinc-800 center text-[10px] font-bold">U{i}</div>
             ))}
          </div>
          <Button variant="ghost" size="sm" className="h-8 text-zinc-400 hover:text-white gap-2 text-xs">
            <Play className="w-3.5 h-3.5" /> Present
          </Button>
          <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white gap-2 text-xs font-semibold px-4 rounded-lg shadow-lg shadow-blue-600/10">
            <Share2 className="w-3.5 h-3.5" /> Share
          </Button>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <LayersPanel />
        <div className="flex-1 relative flex flex-col">
          <Canvas />
          <Toolbar />
        </div>
        <PropertiesPanel />
      </div>
    </div>
  );
}