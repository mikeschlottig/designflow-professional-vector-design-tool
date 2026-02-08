import React, { useRef, useState, useEffect } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { screenToCanvas } from '@/lib/geometry';
import { motion } from 'framer-motion';
export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const elements = useEditorStore((s) => s.elements);
  const selectedId = useEditorStore((s) => s.selectedId);
  const currentTool = useEditorStore((s) => s.currentTool);
  const canvasTransform = useEditorStore((s) => s.canvasTransform);
  const addElement = useEditorStore((s) => s.addElement);
  const updateElement = useEditorStore((s) => s.updateElement);
  const setSelection = useEditorStore((s) => s.setSelection);
  const setCanvasTransform = useEditorStore((s) => s.setCanvasTransform);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || currentTool === 'hand') {
      setIsPanning(true);
      return;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const point = screenToCanvas(e.clientX, e.clientY, rect.left + canvasTransform.x, rect.top + canvasTransform.y, canvasTransform.zoom);
    if (currentTool === 'select') {
      // Basic selection logic handled by SVG element clicks usually, 
      // but we can clear if clicking background
      if (e.target === e.currentTarget || (e.target as SVGElement).id === 'main-svg') {
        setSelection(null);
      }
      return;
    }
    if (currentTool === 'rect' || currentTool === 'circle') {
      setIsDrawing(true);
      setStartPoint(point);
      const id = addElement({
        type: currentTool,
        x: point.x,
        y: point.y,
        width: 1,
        height: 1,
        fill: '#3b82f6',
        stroke: '#2563eb',
        strokeWidth: 1,
        name: currentTool === 'rect' ? 'Rectangle' : 'Circle'
      });
      setActiveId(id);
    }
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setCanvasTransform({
        x: canvasTransform.x + e.movementX,
        y: canvasTransform.y + e.movementY
      });
      return;
    }
    if (!isDrawing || !activeId) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const currentPoint = screenToCanvas(e.clientX, e.clientY, rect.left + canvasTransform.x, rect.top + canvasTransform.y, canvasTransform.zoom);
    const x = Math.min(startPoint.x, currentPoint.x);
    const y = Math.min(startPoint.y, currentPoint.y);
    const width = Math.abs(currentPoint.x - startPoint.x);
    const height = Math.abs(currentPoint.y - startPoint.y);
    updateElement(activeId, { x, y, width, height });
  };
  const handlePointerUp = () => {
    setIsDrawing(false);
    setActiveId(null);
    setIsPanning(false);
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
      className="flex-1 bg-zinc-900 overflow-hidden relative touch-none cursor-crosshair"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    >
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: `${20 * canvasTransform.zoom}px ${20 * canvasTransform.zoom}px`,
          backgroundPosition: `${canvasTransform.x}px ${canvasTransform.y}px`
        }}
      />
      <motion.svg
        id="main-svg"
        className="w-full h-full"
        style={{
          cursor: currentTool === 'hand' || isPanning ? 'grabbing' : currentTool === 'select' ? 'default' : 'crosshair'
        }}
      >
        <g transform={`translate(${canvasTransform.x}, ${canvasTransform.y}) scale(${canvasTransform.zoom})`}>
          {elements.map((el) => {
            const isSelected = selectedId === el.id;
            const props = {
              key: el.id,
              fill: el.fill,
              stroke: isSelected ? '#3b82f6' : el.stroke,
              strokeWidth: isSelected ? 2 / canvasTransform.zoom : el.strokeWidth,
              onPointerDown: (e: React.PointerEvent) => {
                if (currentTool === 'select') {
                  e.stopPropagation();
                  setSelection(el.id);
                }
              }
            };
            if (el.type === 'rect') {
              return <rect {...props} x={el.x} y={el.y} width={el.width} height={el.height} rx={2} />;
            }
            if (el.type === 'circle') {
              return <ellipse {...props} cx={el.x + el.width / 2} cy={el.y + el.height / 2} rx={el.width / 2} ry={el.height / 2} />;
            }
            return null;
          })}
        </g>
      </motion.svg>
    </div>
  );
}