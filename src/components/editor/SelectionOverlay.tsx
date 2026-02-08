import React from 'react';
import { useEditorStore } from '@/store/editor-store';
const HANDLE_SIZE = 8;
export function SelectionOverlay() {
  const elements = useEditorStore((s) => s.elements);
  const selectedId = useEditorStore((s) => s.selectedId);
  const zoom = useEditorStore((s) => s.canvasTransform.zoom);
  const selected = elements.find((el) => el.id === selectedId);
  if (!selected) return null;
  const { x, y, width, height } = selected;
  const scaledHandleSize = HANDLE_SIZE / zoom;
  const offset = scaledHandleSize / 2;
  const handles = [
    { x: x, y: y, cursor: 'nwse-resize' }, // 0: Top-left
    { x: x + width / 2, y: y, cursor: 'ns-resize' }, // 1: Top-mid
    { x: x + width, y: y, cursor: 'nesw-resize' }, // 2: Top-right
    { x: x + width, y: y + height / 2, cursor: 'ew-resize' }, // 3: Right-mid
    { x: x + width, y: y + height, cursor: 'nwse-resize' }, // 4: Bottom-right
    { x: x + width / 2, y: y + height, cursor: 'ns-resize' }, // 5: Bottom-mid
    { x: x, y: y + height, cursor: 'nesw-resize' }, // 6: Bottom-left
    { x: x, y: y + height / 2, cursor: 'ew-resize' }, // 7: Left-mid
  ];
  return (
    <g className="selection-overlay">
      {/* Bounding Box */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={2 / zoom}
        className="pointer-events-none"
      />
      {/* Interaction Handles */}
      {handles.map((h, i) => (
        <rect
          key={i}
          data-handle-index={i}
          x={h.x - offset}
          y={h.y - offset}
          width={scaledHandleSize}
          height={scaledHandleSize}
          fill="white"
          stroke="#3b82f6"
          strokeWidth={1.5 / zoom}
          style={{ cursor: h.cursor, pointerEvents: 'auto' }}
          className="hover:fill-blue-50 transition-colors"
        />
      ))}
    </g>
  );
}