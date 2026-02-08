import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { CanvasElement, CanvasTransform, Design } from '@shared/types';
import { api } from '@/lib/api-client';
export type Tool = 'select' | 'rect' | 'circle' | 'text' | 'hand';
interface EditorState {
  designId: string | null;
  designName: string;
  elements: CanvasElement[];
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
  setCanvasTransform: (transform: Partial<CanvasTransform>) => void;
  setDesignName: (name: string) => void;
  // Persistence
  loadDesign: (id: string) => Promise<void>;
  saveDesign: () => Promise<void>;
}
export const useEditorStore = create<EditorState>((set, get) => ({
  designId: null,
  designName: 'Untitled Design',
  elements: [],
  selectedId: null,
  currentTool: 'select',
  canvasTransform: { x: 0, y: 0, zoom: 1 },
  isDirty: false,
  isSaving: false,
  setTool: (tool) => set({ currentTool: tool }),
  setSelection: (id) => set({ selectedId: id }),
  setDesignName: (name) => set({ designName: name, isDirty: true }),
  addElement: (el) => {
    const id = nanoid();
    set((state) => ({
      elements: [...state.elements, { ...el, id }],
      selectedId: id,
      isDirty: true,
    }));
    return id;
  },
  updateElement: (id, updates) => set((state) => ({
    elements: state.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    isDirty: true,
  })),
  removeElement: (id) => set((state) => ({
    elements: state.elements.filter((el) => el.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId,
    isDirty: true,
  })),
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