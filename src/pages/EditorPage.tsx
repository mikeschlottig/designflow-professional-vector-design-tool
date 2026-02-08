import React, { useEffect, useState, useRef } from 'react';
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
import { Input } from '@/components/ui/input';
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
  const setDesignName = useEditorStore((s) => s.setDesignName);
  const elements = useEditorStore((s) => s.elements);
  const [showShareModal, setShowShareModal] = useState(false);
  const [headerEditing, setHeaderEditing] = useState(false);
  const [headerEditName, setHeaderEditName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    if (showShareModal) {
      setTimeout(() => {
        const input = inputRef.current;
        if (input) {
          input.focus();
          input.select();
        }
      }, 100);
    }
  }, [showShareModal]);

  useEffect(() => {
    if (headerEditing) {
      const input = headerRef.current;
      if (input) {
        input.focus();
        input.select();
      }
    }
  }, [headerEditing]);
  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Copied!');
    } catch {
      setShowShareModal(true);
    }
  };
  const handleExportSVG = () => {
    const svgElement = document.getElementById('canvas-svg');
    if (!svgElement) return;
    
    const clone = svgElement.cloneNode(true) as SVGSVGElement;
    clone.querySelectorAll('[class*="selection"], [data-handle-index]').forEach(o => o.remove());
    
    if (elements.length === 0) {
      clone.setAttribute('viewBox', '0 0 1200 800');
    } else {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      elements.forEach(el => {
        const stroke = el.strokeWidth / 2;
        minX = Math.min(minX, el.x - stroke);
        minY = Math.min(minY, el.y - stroke);
        maxX = Math.max(maxX, el.x + el.width + stroke);
        maxY = Math.max(maxY, el.y + el.height + stroke);
      });
      const pad = 50;
      const vbX = minX - pad;
      const vbY = minY - pad;
      const vbW = maxX - minX + pad * 2;
      const vbH = maxY - minY + pad * 2;
      clone.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
      clone.removeAttribute('width');
      clone.removeAttribute('height');
    }
    
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
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-muted-foreground text-sm">Syncing with cloud...</p>
      </div>
    );
  }
  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      <header className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0 bg-background/80 backdrop-blur z-50">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="h-4 w-px bg-border" />
          {headerEditing ? (
            <input
              ref={headerRef}
              value={headerEditName}
              onChange={(e) => setHeaderEditName(e.target.value)}
              onBlur={() => {
                setDesignName(headerEditName.trim() || 'Untitled Design');
                setHeaderEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setDesignName(headerEditName.trim() || 'Untitled Design');
                  setHeaderEditing(false);
                }
                if (e.key === 'Escape') {
                  setHeaderEditing(false);
                }
              }}
              className="h-7 px-2 bg-transparent border-0 text-sm max-w-[140px] outline-none"
            />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-7 px-2 text-sm gap-1.5 justify-between min-w-[140px]"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setHeaderEditing(true);
                    setHeaderEditName(designName);
                  }}
                >
                  <span className="truncate max-w-[120px]">{designName}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportSVG}>
                  <Download className="w-4 h-4 mr-2" /> Export SVG
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={() => navigate('/')}>Exit to Dashboard</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="mr-4">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> : <Cloud className="w-4 h-4 text-blue-500" />}
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
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-muted/80 border border-border rounded-full px-4 py-2 text-[10px] text-muted-foreground">
              Presentation Mode • Press <kbd className="bg-muted px-1 rounded">Esc</kbd> or <kbd className="bg-muted px-1 rounded">⌘P</kbd> to exit
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
      {showShareModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-background border border-border rounded-xl p-6 shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Copy Share Link</h3>
            <Input 
              ref={inputRef} 
              value={window.location.href} 
              readOnly 
              className="font-mono text-sm p-3 border rounded-md bg-muted mb-3" 
            />
            <p className="text-xs text-muted-foreground mb-4">Select all and copy (⌘C)</p>
            <Button className="w-full" variant="outline" onClick={() => setShowShareModal(false)}>
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}