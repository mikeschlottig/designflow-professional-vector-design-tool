import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { CanvasElement, CanvasTransform, Design, ElementType } from '@shared/types';
import { api } from '@/lib/api-client';
export type Tool = 'select' | 'rect' | 'circle' | 'text' | 'hand';
interface EditorState {
  designId: string | null;
  designName: string;
  elements: CanvasElement[];
  past: CanvasElement[][];
  future: CanvasElement[][];
  selectedId: string | null;
  currentTool: Tool;
  canvasTransform: CanvasTransform;
  isDirty: boolean;
  isSaving: boolean;
  // Actions
  setTool: (tool: Tool) => void;
  setSelection: (id: string | null) => void;
  addElement: (element: Omit<CanvasElement, 'id'>) => string;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  setElements: (elements: CanvasElement[]) => void;
  setCanvasTransform: (transform: Partial<CanvasTransform>) => void;
  setDesignName: (name: string) => void;
  // History
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
  // Arrangement & Manipulation
  duplicateElement: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  moveForward: (id: string) => void;
  moveBackward: (id: string) => void;
  // Persistence
  loadDesign: (id: string) => Promise<void>;
  saveDesign: () => Promise<void>;
}
export const useEditorStore = create<EditorState>((set, get) => ({
  designId: null,
  designName: 'Untitled Design',
  elements: [],
  past: [],
  future: [],
  selectedId: null,
  currentTool: 'select',
  canvasTransform: { x: 0, y: 0, zoom: 1 },
  isDirty: false,
  isSaving: false,
  saveHistory: () => {
    const { elements, past } = get();
    set({ 
      past: [...past.slice(-49), elements], // Keep last 50 states
      future: [] 
    });
  },
  undo: () => {
    const { past, elements, future } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    set({
      past: newPast,
      elements: previous,
      future: [elements, ...future],
      isDirty: true
    });
  },
  redo: () => {
    const { past, elements, future } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    set({
      past: [...past, elements],
      elements: next,
      future: newFuture,
      isDirty: true
    });
  },
  setTool: (tool) => set({ currentTool: tool }),
  setSelection: (id) => set({ selectedId: id }),
  setDesignName: (name) => set({ designName: name, isDirty: true }),
  addElement: (el) => {
    const id = nanoid();
    get().saveHistory();
    set((state) => ({
      elements: [...state.elements, { ...el, id }],
      selectedId: id,
      isDirty: true,
    }));
    return id;
  },
  updateElement: (id, updates) => {
    // Only save history if it's a significant move or update (usually handled at PointerUp in Canvas)
    set((state) => ({
      elements: state.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
      isDirty: true,
    }));
  },
  removeElement: (id) => {
    get().saveHistory();
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
      isDirty: true,
    }));
  },
  setElements: (elements) => {
    set({ elements, isDirty: true });
  },
  duplicateElement: (id) => {
    const el = get().elements.find(e => e.id === id);
    if (!el) return;
    get().saveHistory();
    const newId = nanoid();
    const newEl = { ...el, id: newId, x: el.x + 20, y: el.y + 20, name: `${el.name} Copy` };
    set(state => ({
      elements: [...state.elements, newEl],
      selectedId: newId,
      isDirty: true
    }));
  },
  bringToFront: (id) => {
    get().saveHistory();
    set(state => {
      const el = state.elements.find(e => e.id === id);
      if (!el) return state;
      return { elements: [...state.elements.filter(e => e.id !== id), el] };
    });
  },
  sendToBack: (id) => {
    get().saveHistory();
    set(state => {
      const el = state.elements.find(e => e.id === id);
      if (!el) return state;
      return { elements: [el, ...state.elements.filter(e => e.id !== id)] };
    });
  },
  moveForward: (id) => {
    get().saveHistory();
    set(state => {
      const idx = state.elements.findIndex(e => e.id === id);
      if (idx === -1 || idx === state.elements.length - 1) return state;
      const newElements = [...state.elements];
      [newElements[idx], newElements[idx + 1]] = [newElements[idx + 1], newElements[idx]];
      return { elements: newElements };
    });
  },
  moveBackward: (id) => {
    get().saveHistory();
    set(state => {
      const idx = state.elements.findIndex(e => e.id === id);
      if (idx <= 0) return state;
      const newElements = [...state.elements];
      [newElements[idx], newElements[idx - 1]] = [newElements[idx - 1], newElements[idx]];
      return { elements: newElements };
    });
  },
  setCanvasTransform: (transform) => set((state) => ({
    canvasTransform: { ...state.canvasTransform, ...transform },
    isDirty: true,
  })),
  loadDesign: async (id) => {
    try {
      const design = await api<Design>(`/api/designs/${id}`);
      set({
        designId: design.id,
        designName: design.name,
        elements: design.elements,
        canvasTransform: design.canvasTransform,
        isDirty: false,
        past: [],
        future: []
      });
    } catch (err) {
      console.error('Failed to load design:', err);
    }
  },
  saveDesign: async () => {
    const { designId, designName, elements, canvasTransform, isDirty, isSaving } = get();
    if (!designId || !isDirty || isSaving) return;
    set({ isSaving: true });
    try {
      await api<Design>(`/api/designs/${designId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: designName,
          elements,
          canvasTransform,
        }),
      });
      set({ isDirty: false });
    } catch (err) {
      console.error('Failed to save design:', err);
    } finally {
      set({ isSaving: false });
    }
  },
}));