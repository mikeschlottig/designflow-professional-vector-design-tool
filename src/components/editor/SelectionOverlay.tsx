import React from 'react';
import { useEditorStore } from '@/store/editor-store';
import { getElementsBoundingBox } from '@/lib/geometry';
const HANDLE_SIZE = 8;
export function SelectionOverlay() {
  const elements = useEditorStore((s) => s.elements);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const zoom = useEditorStore((s) => s.canvasTransform.zoom);
  const selectedElements = elements.filter(el => selectedIds.includes(el.id));
  if (selectedElements.length === 0) return null;
  const box = getElementsBoundingBox(selectedElements);
  if (!box) return null;
  const { x, y, width, height } = box;
  const scaledHandleSize = HANDLE_SIZE / zoom;
  const offset = scaledHandleSize / 2;
  const showHandles = selectedIds.length === 1;
  const handles = showHandles ? [
    { x: x, y: y, cursor: 'nwse-resize' }, 
    { x: x + width / 2, y: y, cursor: 'ns-resize' }, 
    { x: x + width, y: y, cursor: 'nesw-resize' }, 
    { x: x + width, y: y + height / 2, cursor: 'ew-resize' }, 
    { x: x + width, y: y + height, cursor: 'nwse-resize' }, 
    { x: x + width / 2, y: y + height, cursor: 'ns-resize' }, 
    { x: x, y: y + height, cursor: 'nesw-resize' }, 
    { x: x, y: y + height / 2, cursor: 'ew-resize' },
  ] : [];
  return (
    <g className="selection-overlay">
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={2 / zoom}
        className="pointer-events-none"
      />
      {handles.map((h, i) => (
        <rect
          key={i}
          data-handle-index={i}
          x={h.x - offset}
          y={h.y - offset}
          width={scaledHandleSize}
          height={scaledHandleSize}
          fill="hsl(var(--foreground))"
          stroke="hsl(var(--foreground))"
          strokeWidth={1.5 / zoom}
          style={{ cursor: h.cursor, pointerEvents: 'auto' }}
          className="hover:fill-primary/20 transition-colors"
        />
      ))}
    </g>
  );
}