import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { screenToCanvas, isPointInRect } from '@/lib/geometry';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Copy, Trash2, Layers } from 'lucide-react';
export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const elements = useEditorStore((s) => s.elements);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const currentTool = useEditorStore((s) => s.currentTool);
  const canvasTransform = useEditorStore((s) => s.canvasTransform);
  const addElement = useEditorStore((s) => s.addElement);
  const updateElement = useEditorStore((s) => s.updateElement);
  const removeSelected = useEditorStore((s) => s.removeSelected);
  const setSelection = useEditorStore((s) => s.setSelection);
  const toggleSelection = useEditorStore((s) => s.toggleSelection);
  const setCanvasTransform = useEditorStore((s) => s.setCanvasTransform);
  const setTool = useEditorStore((s) => s.setTool);
  const saveDesign = useEditorStore((s) => s.saveDesign);
  const saveHistory = useEditorStore((s) => s.saveHistory);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const duplicateSelected = useEditorStore((s) => s.duplicateSelected);
  const bringToFront = useEditorStore((s) => s.bringToFront);
  const sendToBack = useEditorStore((s) => s.sendToBack);
  const nudgeElements = useEditorStore((s) => s.nudgeElements);
  const isDirty = useEditorStore((s) => s.isDirty);
  const presentationMode = useEditorStore((s) => s.presentationMode);
  const [interaction, setInteraction] = useState<{
    type: 'idle' | 'drawing' | 'moving' | 'panning' | 'resizing';
    activeId: string | null;
    handleIndex?: number;
    startPoint: { x: number; y: number };
    elementsStartPos?: Map<string, { x: number; y: number; width: number; height: number }>;
  }>({ type: 'idle', activeId: null, startPoint: { x: 0, y: 0 } });

  const svgRef = useRef<SVGSVGElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastClickRef = useRef({ el: '', time: 0 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [overlayTextRect, setOverlayTextRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    fontSize: number;
  } | null>(null);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      const isMod = e.ctrlKey || e.metaKey;
      if (isMod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (isMod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if (isMod && e.key === 'd') { e.preventDefault(); duplicateSelected(); }
      if (e.key === 'Delete' || e.key === 'Backspace') { removeSelected(); }
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        const delta = e.shiftKey ? 10 : 1;
        let dx = 0, dy = 0;
        if (e.key === 'ArrowLeft') dx = -delta;
        if (e.key === 'ArrowRight') dx = delta;
        if (e.key === 'ArrowUp') dy = -delta;
        if (e.key === 'ArrowDown') dy = delta;
        nudgeElements(dx, dy);
      }
      if (e.code === 'Space' && !e.repeat) setTool('hand');
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
  }, [undo, redo, duplicateSelected, removeSelected, nudgeElements, setTool]);

  useEffect(() => {
    if (editingTextId && svgRef.current) {
      const el = svgRef.current.querySelector(`[data-el-id="${editingTextId}"]`) as SVGTextElement;
      if (el) {
        const rect = el.getBoundingClientRect();
        const containerRect = containerRef.current!.getBoundingClientRect();
        setOverlayTextRect({
          left: rect.left - containerRect.left,
          top: rect.top - containerRect.top,
          width: rect.width,
          height: rect.height,
          fontSize: parseFloat(el.style.fontSize || el.getAttribute('font-size') || '16')
        });
        requestAnimationFrame(() => textareaRef.current?.focus());
      }
    } else {
      setOverlayTextRect(null);
    }
  }, [editingTextId]);
  useEffect(() => {
    if (isDirty) {
      const timer = setTimeout(() => saveDesign(), 3000);
      return () => clearTimeout(timer);
    }
  }, [isDirty, saveDesign]);
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 2) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const point = screenToCanvas(e.clientX, e.clientY, rect.left + canvasTransform.x, rect.top + canvasTransform.y, canvasTransform.zoom);
    const target = e.target as HTMLElement;
    const handleIdx = target.getAttribute('data-handle-index');
    if (handleIdx !== null && selectedIds.length === 1) {
      const el = elements.find(item => item.id === selectedIds[0]);
      if (el) {
        saveHistory();
        const startPosMap = new Map();
        startPosMap.set(el.id, { x: el.x, y: el.y, width: el.width, height: el.height });
        setInteraction({
          type: 'resizing',
          activeId: selectedIds[0],
          handleIndex: parseInt(handleIdx),
          startPoint: point,
          elementsStartPos: startPosMap
        });
        return;
      }
    }
    if (e.button === 1 || currentTool === 'hand') {
      setInteraction({ type: 'panning', activeId: null, startPoint: { x: e.clientX, y: e.clientY } });
      return;
    }
    if (currentTool === 'select') {
      const clickedEl = [...elements].reverse().find(el => isPointInRect(point, el));
      const now = Date.now();
      if (clickedEl?.type === 'text' && lastClickRef.current.el === clickedEl.id && now - lastClickRef.current.time < 350) {
        setEditingTextId(clickedEl.id);
        lastClickRef.current = { el: '', time: 0 };
        return;
      }
      if (clickedEl) {
        if (e.shiftKey) {
          toggleSelection(clickedEl.id);
        } else {
          setSelection(clickedEl.id);
        }
        const startPosMap = new Map();
        Array.from(selectedIds).forEach(id => {
          const el = elements.find(el => el.id === id);
          if (el) {
            startPosMap.set(id, { x: el.x, y: el.y, width: el.width, height: el.height });
          }
        });
        setInteraction({
          type: 'moving',
          activeId: clickedEl.id,
          startPoint: point,
          elementsStartPos: startPosMap
        });
      } else {
        setSelection(null);
      }
      lastClickRef.current.el = clickedEl?.id || '';
      lastClickRef.current.time = now;
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
        text: isText ? 'Edit Content' : undefined,
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
        x: canvasTransform.x + (e.clientX - interaction.startPoint.x),
        y: canvasTransform.y + (e.clientY - interaction.startPoint.y)
      });
      setInteraction(prev => ({ ...prev, startPoint: { x: e.clientX, y: e.clientY } }));
      return;
    }
    if (interaction.type === 'moving' && interaction.elementsStartPos) {
      const dx = point.x - interaction.startPoint.x;
      const dy = point.y - interaction.startPoint.y;
      interaction.elementsStartPos.forEach((start, id) => {
        updateElement(id, { x: start.x + dx, y: start.y + dy });
      });
      return;
    }
    if (interaction.type === 'resizing' && interaction.activeId && interaction.elementsStartPos && interaction.handleIndex !== undefined) {
      const dx = point.x - interaction.startPoint.x;
      const dy = point.y - interaction.startPoint.y;
      const start = interaction.elementsStartPos.get(interaction.activeId);
      if (!start) return;
      let { x, y, width, height } = start;
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
    if (interaction.type !== 'idle') {
      setInteraction({ type: 'idle', activeId: null, startPoint: { x: 0, y: 0 } });
      saveDesign();
    }
  };
  const handleWheel = (e: React.WheelEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomSpeed = 0.002;
      const delta = -e.deltaY;
      const scale = 1 + delta * zoomSpeed;
      const nextZoom = Math.min(Math.max(canvasTransform.zoom * scale, 0.05), 20);
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const canvasMouseX = (mouseX - canvasTransform.x) / canvasTransform.zoom;
      const canvasMouseY = (mouseY - canvasTransform.y) / canvasTransform.zoom;
      const nextX = mouseX - canvasMouseX * nextZoom;
      const nextY = mouseY - canvasMouseY * nextZoom;
      setCanvasTransform({ zoom: nextZoom, x: nextX, y: nextY });
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
          className="flex-1 bg-background overflow-hidden relative touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          style={{ cursor: currentTool === 'hand' ? 'grab' : 'crosshair' }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.08]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgb(148 163 184 / 0.3) 1px, transparent 1px)',
              backgroundSize: `${40 * canvasTransform.zoom}px ${40 * canvasTransform.zoom}px`,
              backgroundPosition: `${canvasTransform.x}px ${canvasTransform.y}px`
            }}
          />
          <motion.svg ref={svgRef} className="w-full h-full" id="canvas-svg">
            <g transform={`translate(${canvasTransform.x}, ${canvasTransform.y}) scale(${canvasTransform.zoom})`}>
              {elements.map((el) => {
                const isSelected = selectedIds.includes(el.id);
                const shapeProps = {
                  fill: el.fill,
                  stroke: isSelected ? '#3b82f6' : el.stroke,
                  strokeWidth: isSelected ? 2 / canvasTransform.zoom : el.strokeWidth / canvasTransform.zoom,
                };
                if (el.type === 'rect') return <rect key={el.id} data-el-id={el.id} {...shapeProps} x={el.x} y={el.y} width={el.width} height={el.height} rx={2} />;
                if (el.type === 'circle') return <ellipse key={el.id} data-el-id={el.id} {...shapeProps} cx={el.x + el.width/2} cy={el.y + el.height/2} rx={el.width/2} ry={el.height/2} />;
                if (el.type === 'text') {
                  return (
                    <text
                      key={el.id}
                      data-el-id={el.id}
                      {...shapeProps}
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
              {!presentationMode && <SelectionOverlay />}
            </g>
          </motion.svg>
        </div>
        {editingTextId && overlayTextRect && (
          <div
            className="absolute z-20"
            style={{
              left: overlayTextRect.left,
              top: overlayTextRect.top,
              width: overlayTextRect.width,
              height: overlayTextRect.height
            }}
          >
            <textarea
              ref={textareaRef}
              value={elements.find(e => e.id === editingTextId)?.text || ''}
              onChange={(e) => updateElement(editingTextId!, { text: e.target.value })}
              onBlur={() => setEditingTextId(null)}
              className="w-full h-full resize-none border-2 border-primary/50 bg-background/95 backdrop-blur text-inherit outline-none p-1"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: overlayTextRect.fontSize,
                fontWeight: 500,
                lineHeight: 1.25
              }}
            />
          </div>
        )}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem onClick={duplicateSelected} disabled={selectedIds.length === 0}>
          <Copy className="w-4 h-4 mr-2" /> Duplicate <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={removeSelected} disabled={selectedIds.length === 0} className="text-red-400">
          <Trash2 className="w-4 h-4 mr-2" /> Delete <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={bringToFront} disabled={selectedIds.length === 0}>
          <Layers className="w-4 h-4 mr-2" /> Bring to Front
        </ContextMenuItem>
        <ContextMenuItem onClick={sendToBack} disabled={selectedIds.length === 0}>
          <Layers className="w-4 h-4 mr-2" /> Send to Back
        </ContextMenuItem>
        <ContextMenuSeparator />
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