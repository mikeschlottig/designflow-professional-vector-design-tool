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