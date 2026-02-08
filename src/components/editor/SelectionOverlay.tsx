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
    { x: x, y: y, cursor: 'nwse-resize' }, // Top-left
    { x: x + width / 2, y: y, cursor: 'ns-resize' }, // Top-mid
    { x: x + width, y: y, cursor: 'nesw-resize' }, // Top-right
    { x: x + width, y: y + height / 2, cursor: 'ew-resize' }, // Right-mid
    { x: x + width, y: y + height, cursor: 'nwse-resize' }, // Bottom-right
    { x: x + width / 2, y: y + height, cursor: 'ns-resize' }, // Bottom-mid
    { x: x, y: y + height, cursor: 'nesw-resize' }, // Bottom-left
    { x: x, y: y + height / 2, cursor: 'ew-resize' }, // Left-mid
  ];
  return (
    <g className="pointer-events-none">
      {/* Bounding Box */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={2 / zoom}
      />
      {/* Interaction Handles */}
      {handles.map((h, i) => (
        <rect
          key={i}
          x={h.x - offset}
          y={h.y - offset}
          width={scaledHandleSize}
          height={scaledHandleSize}
          fill="white"
          stroke="#3b82f6"
          strokeWidth={1.5 / zoom}
          style={{ cursor: h.cursor, pointerEvents: 'auto' }}
        />
      ))}
    </g>
  );
}