import { create } from 'zustand';
import { nanoid } from 'nanoid';
export type ElementType = 'rect' | 'circle' | 'text';
export interface CanvasElement {
  id: string;
  type: ElementType;
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
export type Tool = 'select' | 'rect' | 'circle' | 'text' | 'hand';
interface EditorState {
  elements: CanvasElement[];
  selectedId: string | null;
  currentTool: Tool;
  canvasTransform: {
    x: number;
    y: number;
    zoom: number;
  };
  // Actions
  setTool: (tool: Tool) => void;
  setSelection: (id: string | null) => void;
  addElement: (element: Omit<CanvasElement, 'id'>) => string;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  setCanvasTransform: (transform: Partial<{ x: number; y: number; zoom: number }>) => void;
}
export const useEditorStore = create<EditorState>((set) => ({
  elements: [],
  selectedId: null,
  currentTool: 'select',
  canvasTransform: { x: 0, y: 0, zoom: 1 },
  setTool: (tool) => set({ currentTool: tool }),
  setSelection: (id) => set({ selectedId: id }),
  addElement: (el) => {
    const id = nanoid();
    set((state) => ({
      elements: [...state.elements, { ...el, id }],
      selectedId: id,
    }));
    return id;
  },
  updateElement: (id, updates) => set((state) => ({
    elements: state.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
  })),
  removeElement: (id) => set((state) => ({
    elements: state.elements.filter((el) => el.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId,
  })),
  setCanvasTransform: (transform) => set((state) => ({
    canvasTransform: { ...state.canvasTransform, ...transform },
  })),
}));