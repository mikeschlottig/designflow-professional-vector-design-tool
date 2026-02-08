export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number;
}
export interface CanvasElement {
  id: string;
  type: 'rect' | 'circle' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  text?: string;
  name: string;
}
export interface CanvasTransform {
  x: number;
  y: number;
  zoom: number;
}
export interface Design {
  id: string;
  name: string;
  elements: CanvasElement[];
  canvasTransform: CanvasTransform;
  createdAt: number;
  updatedAt: number;
}