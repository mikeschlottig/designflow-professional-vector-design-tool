import React from 'react';
import { Canvas } from '@/components/editor/Canvas';
import { Toolbar } from '@/components/editor/Toolbar';
import { LayersPanel } from '@/components/editor/LayersPanel';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Share2, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
export function EditorPage() {
  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
      {/* Header */}
      <header className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="h-4 w-px bg-zinc-800" />
          <span className="text-sm font-medium">Untitled Design</span>
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
      {/* Main Content Area */}
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