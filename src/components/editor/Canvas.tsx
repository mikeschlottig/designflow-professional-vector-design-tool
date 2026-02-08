import React, { useRef, useState, useEffect } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { screenToCanvas } from '@/lib/geometry';
import { motion } from 'framer-motion';
import { SelectionOverlay } from './SelectionOverlay';
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
  const saveDesign = useEditorStore((s) => s.saveDesign);
  const isDirty = useEditorStore((s) => s.isDirty);
  const [interaction, setInteraction] = useState<{
    type: 'idle' | 'drawing' | 'moving' | 'panning';
    activeId: string | null;
    startPoint: { x: number; y: number };
    elementStartPos?: { x: number; y: number };
  }>({ type: 'idle', activeId: null, startPoint: { x: 0, y: 0 } });
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId && document.activeElement?.tagName !== 'INPUT') {
          removeElement(selectedId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, removeElement]);
  // Auto-save debounced
  useEffect(() => {
    if (isDirty) {
      const timer = setTimeout(() => saveDesign(), 2000);
      return () => clearTimeout(timer);
    }
  }, [isDirty, saveDesign]);
  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const point = screenToCanvas(e.clientX, e.clientY, rect.left + canvasTransform.x, rect.top + canvasTransform.y, canvasTransform.zoom);
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
          elementStartPos: { x: clickedEl.x, y: clickedEl.y }
        });
      } else {
        setSelection(null);
      }
      return;
    }
    if (['rect', 'circle'].includes(currentTool)) {
      const id = addElement({
        type: currentTool as any,
        x: point.x,
        y: point.y,
        width: 1,
        height: 1,
        fill: '#3b82f6',
        stroke: '#2563eb',
        strokeWidth: 1,
        name: currentTool === 'rect' ? 'Rectangle' : 'Circle'
      });
      setInteraction({ type: 'drawing', activeId: id, startPoint: point });
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
    if (interaction.type === 'drawing' && interaction.activeId) {
      const x = Math.min(interaction.startPoint.x, point.x);
      const y = Math.min(interaction.startPoint.y, point.y);
      const width = Math.abs(point.x - interaction.startPoint.x);
      const height = Math.abs(point.y - interaction.startPoint.y);
      updateElement(interaction.activeId, { x, y, width, height });
    }
  };
  const handlePointerUp = () => {
    if (interaction.type !== 'idle') {
      setInteraction({ type: 'idle', activeId: null, startPoint: { x: 0, y: 0 } });
      saveDesign();
    }
  };
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
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
    <div
      ref={containerRef}
      className="flex-1 bg-zinc-900 overflow-hidden relative touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      style={{ cursor: currentTool === 'hand' ? 'grab' : 'crosshair' }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: `${20 * canvasTransform.zoom}px ${20 * canvasTransform.zoom}px`,
          backgroundPosition: `${canvasTransform.x}px ${canvasTransform.y}px`
        }}
      />
      <motion.svg className="w-full h-full">
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
            return null;
          })}
          <SelectionOverlay />
        </g>
      </motion.svg>
    </div>
  );
}