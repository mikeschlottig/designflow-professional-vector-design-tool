import { CanvasElement } from "@shared/types";
export interface Point {
  x: number;
  y: number;
}
export function screenToCanvas(
  screenX: number,
  screenY: number,
  canvasX: number,
  canvasY: number,
  zoom: number
): Point {
  return {
    x: (screenX - canvasX) / zoom,
    y: (screenY - canvasY) / zoom,
  };
}
export function canvasToScreen(
  canvasXPos: number,
  canvasYPos: number,
  canvasX: number,
  canvasY: number,
  zoom: number
): Point {
  return {
    x: canvasXPos * zoom + canvasX,
    y: canvasYPos * zoom + canvasY,
  };
}
export function isPointInRect(point: Point, rect: { x: number, y: number, width: number, height: number }): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}
export function getElementsBoundingBox(elements: CanvasElement[]) {
  if (elements.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  elements.forEach(el => {
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + el.width);
    maxY = Math.max(maxY, el.y + el.height);
  });
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}