import React, { useRef, useState, useEffect } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { screenToCanvas } from '@/lib/geometry';
import { motion } from 'framer-motion';
import { SelectionOverlay } from './SelectionOverlay';
import { ElementType } from '@shared/types';
import { 
  ContextMenu, 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuSeparator, 
  ContextMenuTrigger,
  ContextMenuShortcut
} from "@/components/ui/context-menu";
import { Copy, Trash2, ArrowUp, ArrowDown, Layers, Square, Circle, Type } from 'lucide-react';
export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const elements = useEditorStore((s) => s.elements);
  const selectedId = useEditorStore((s) => s.selectedId);
  const currentTool = useEditorStore((s) => s.currentTool);
  const canvasTransform = useEditorStore((s) => s.canvasTransform);
  const addElement = useEditorStore((s) => s.addElement);
  const updateElement = useEditorStore((s) => s.updateElement);
  const removeElement = useEditorStore((s) => s.removeElement);
  const setSelection = useEditorStore((s) => s.setSelection);
  const setCanvasTransform = useEditorStore((s) => s.setCanvasTransform);
  const setTool = useEditorStore((s) => s.setTool);
  const saveDesign = useEditorStore((s) => s.saveDesign);
  const saveHistory = useEditorStore((s) => s.saveHistory);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const duplicateElement = useEditorStore((s) => s.duplicateElement);
  const bringToFront = useEditorStore((s) => s.bringToFront);
  const sendToBack = useEditorStore((s) => s.sendToBack);
  const isDirty = useEditorStore((s) => s.isDirty);
  const [interaction, setInteraction] = useState<{
    type: 'idle' | 'drawing' | 'moving' | 'panning' | 'resizing';
    activeId: string | null;
    handleIndex?: number;
    startPoint: { x: number; y: number };
    elementStartPos?: { x: number; y: number; width: number; height: number };
  }>({ type: 'idle', activeId: null, startPoint: { x: 0, y: 0 } });
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      const isMod = e.ctrlKey || e.metaKey;
      if (isMod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (isMod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if (isMod && e.key === 'd') { e.preventDefault(); if (selectedId) duplicateElement(selectedId); }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) removeElement(selectedId);
      }
      if (e.code === 'Space' && !e.repeat) {
        setTool('hand');
      }
      // Shortcuts
      if (e.key === 'v') setTool('select');
      if (e.key === 'r') setTool('rect');
      if (e.key === 'o') setTool('circle');
      if (e.key === 't') setTool('text');
      if (e.key === 'h') setTool('hand');
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setTool('select');
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedId, removeElement, setTool, undo, redo, duplicateElement]);
  useEffect(() => {
    if (isDirty) {
      const timer = setTimeout(() => saveDesign(), 2000);
      return () => clearTimeout(timer);
    }
  }, [isDirty, saveDesign]);
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 2) return; // Right click handled by context menu
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const point = screenToCanvas(e.clientX, e.clientY, rect.left + canvasTransform.x, rect.top + canvasTransform.y, canvasTransform.zoom);
    const target = e.target as HTMLElement;
    const handleIdx = target.getAttribute('data-handle-index');
    if (handleIdx !== null && selectedId) {
      const el = elements.find(item => item.id === selectedId);
      if (el) {
        saveHistory();
        setInteraction({
          type: 'resizing',
          activeId: selectedId,
          handleIndex: parseInt(handleIdx),
          startPoint: point,
          elementStartPos: { x: el.x, y: el.y, width: el.width, height: el.height }
        });
        return;
      }
    }
    if (e.button === 1 || currentTool === 'hand') {
      setInteraction({ type: 'panning', activeId: null, startPoint: point });
      return;
    }
    if (currentTool === 'select') {
      const clickedEl = [...elements].reverse().find(el => (
        point.x >= el.x && point.x <= el.x + el.width &&
        point.y >= el.y && point.y <= el.y + el.height
      ));
      if (clickedEl) {
        setSelection(clickedEl.id);
        setInteraction({
          type: 'moving',
          activeId: clickedEl.id,
          startPoint: point,
          elementStartPos: { x: clickedEl.x, y: clickedEl.y, width: clickedEl.width, height: clickedEl.height }
        });
      } else {
        setSelection(null);
      }
      return;
    }
    if (['rect', 'circle', 'text'].includes(currentTool)) {
      saveHistory();
      const isText = currentTool === 'text';
      const id = addElement({
        type: currentTool as ElementType,
        x: point.x,
        y: point.y,
        width: isText ? 150 : 1,
        height: isText ? 30 : 1,
        fill: isText ? '#ffffff' : '#3b82f6',
        stroke: isText ? 'transparent' : '#2563eb',
        strokeWidth: isText ? 0 : 1,
        name: isText ? 'Text' : (currentTool === 'rect' ? 'Rectangle' : 'Circle'),
        text: isText ? 'Double click properties to edit' : undefined,
        fontSize: isText ? 16 : undefined,
      });
      if (isText) {
        setInteraction({ type: 'idle', activeId: null, startPoint: point });
        setTool('select');
      } else {
        setInteraction({ type: 'drawing', activeId: id, startPoint: point });
      }
    }
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const point = screenToCanvas(e.clientX, e.clientY, rect.left + canvasTransform.x, rect.top + canvasTransform.y, canvasTransform.zoom);
    if (interaction.type === 'panning') {
      setCanvasTransform({
        x: canvasTransform.x + e.movementX,
        y: canvasTransform.y + e.movementY
      });
      return;
    }
    if (interaction.type === 'moving' && interaction.activeId && interaction.elementStartPos) {
      const dx = point.x - interaction.startPoint.x;
      const dy = point.y - interaction.startPoint.y;
      updateElement(interaction.activeId, {
        x: interaction.elementStartPos.x + dx,
        y: interaction.elementStartPos.y + dy
      });
      return;
    }
    if (interaction.type === 'resizing' && interaction.activeId && interaction.elementStartPos && interaction.handleIndex !== undefined) {
      const dx = point.x - interaction.startPoint.x;
      const dy = point.y - interaction.startPoint.y;
      const { x, y, width, height } = interaction.elementStartPos;
      let nx = x, ny = y, nw = width, nh = height;
      switch (interaction.handleIndex) {
        case 0: nx += dx; ny += dy; nw -= dx; nh -= dy; break;
        case 1: ny += dy; nh -= dy; break;
        case 2: ny += dy; nw += dx; nh -= dy; break;
        case 3: nw += dx; break;
        case 4: nw += dx; nh += dy; break;
        case 5: nh += dy; break;
        case 6: nx += dx; nw -= dx; nh += dy; break;
        case 7: nx += dx; nw -= dx; break;
      }
      updateElement(interaction.activeId, { x: nx, y: ny, width: Math.max(1, nw), height: Math.max(1, nh) });
      return;
    }
    if (interaction.type === 'drawing' && interaction.activeId) {
      const nx = Math.min(interaction.startPoint.x, point.x);
      const ny = Math.min(interaction.startPoint.y, point.y);
      const nw = Math.abs(point.x - interaction.startPoint.x);
      const nh = Math.abs(point.y - interaction.startPoint.y);
      updateElement(interaction.activeId, { x: nx, y: ny, width: nw, height: nh });
    }
  };
  const handlePointerUp = () => {
    if (interaction.type === 'moving' || interaction.type === 'resizing') {
      // Logic for saving history was done at PointerDown for these, 
      // but maybe we only want to save if it actually changed?
    }
    if (interaction.type !== 'idle') {
      setInteraction({ type: 'idle', activeId: null, startPoint: { x: 0, y: 0 } });
      saveDesign();
    }
  };
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      const zoomDelta = -e.deltaY * 0.001;
      const nextZoom = Math.min(Math.max(canvasTransform.zoom + zoomDelta, 0.1), 10);
      setCanvasTransform({ zoom: nextZoom });
    } else {
      setCanvasTransform({
        x: canvasTransform.x - e.deltaX,
        y: canvasTransform.y - e.deltaY
      });
    }
  };
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={containerRef}
          className="flex-1 bg-zinc-950 overflow-hidden relative touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          style={{ cursor: currentTool === 'hand' ? 'grab' : 'crosshair' }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.05]"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: `${40 * canvasTransform.zoom}px ${40 * canvasTransform.zoom}px`,
              backgroundPosition: `${canvasTransform.x}px ${canvasTransform.y}px`
            }}
          />
          <motion.svg className="w-full h-full" id="canvas-svg">
            <g transform={`translate(${canvasTransform.x}, ${canvasTransform.y}) scale(${canvasTransform.zoom})`}>
              {elements.map((el) => {
                const isSelected = selectedId === el.id;
                const commonProps = {
                  key: el.id,
                  fill: el.fill,
                  stroke: isSelected ? '#3b82f6' : el.stroke,
                  strokeWidth: isSelected ? 2 / canvasTransform.zoom : el.strokeWidth / canvasTransform.zoom,
                };
                if (el.type === 'rect') {
                  return <rect {...commonProps} x={el.x} y={el.y} width={el.width} height={el.height} rx={2} />;
                }
                if (el.type === 'circle') {
                  return <ellipse {...commonProps} cx={el.x + el.width/2} cy={el.y + el.height/2} rx={el.width/2} ry={el.height/2} />;
                }
                if (el.type === 'text') {
                  return (
                    <text
                      {...commonProps}
                      x={el.x}
                      y={el.y + (el.fontSize || 16)}
                      style={{
                        fontSize: el.fontSize || 16,
                        fontFamily: 'Inter, sans-serif',
                        userSelect: 'none',
                        pointerEvents: 'none',
                        fontWeight: 500
                      }}
                    >
                      {el.text}
                    </text>
                  );
                }
                return null;
              })}
              <SelectionOverlay />
            </g>
          </motion.svg>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64 bg-zinc-900 border-zinc-800 text-zinc-300">
        <ContextMenuItem onClick={() => selectedId && duplicateElement(selectedId)} disabled={!selectedId}>
          <Copy className="w-4 h-4 mr-2" /> Duplicate <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={() => selectedId && removeElement(selectedId)} disabled={!selectedId} className="text-red-400">
          <Trash2 className="w-4 h-4 mr-2" /> Delete <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-zinc-800" />
        <ContextMenuItem onClick={() => selectedId && bringToFront(selectedId)} disabled={!selectedId}>
          <Layers className="w-4 h-4 mr-2" /> Bring to Front
        </ContextMenuItem>
        <ContextMenuItem onClick={() => selectedId && sendToBack(selectedId)} disabled={!selectedId}>
          <Layers className="w-4 h-4 mr-2" /> Send to Back
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-zinc-800" />
        <ContextMenuItem onClick={undo}>
          Undo <ContextMenuShortcut>⌘Z</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={redo}>
          Redo <ContextMenuShortcut>⌘⇧Z</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}