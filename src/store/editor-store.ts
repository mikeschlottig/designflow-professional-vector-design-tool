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
  selectedIds: string[];
  currentTool: Tool;
  canvasTransform: CanvasTransform;
  isDirty: boolean;
  isSaving: boolean;
  presentationMode: boolean;
  // Actions
  setTool: (tool: Tool) => void;
  setSelection: (ids: string | string[] | null) => void;
  toggleSelection: (id: string) => void;
  addElement: (element: Omit<CanvasElement, 'id'>) => string;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeSelected: () => void;
  setElements: (elements: CanvasElement[]) => void;
  setCanvasTransform: (transform: Partial<CanvasTransform>) => void;
  setDesignName: (name: string) => void;
  togglePresentationMode: () => void;
  // History
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
  // Arrangement & Manipulation
  nudgeElements: (dx: number, dy: number) => void;
  duplicateSelected: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
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
  selectedIds: [],
  currentTool: 'select',
  canvasTransform: { x: 0, y: 0, zoom: 1 },
  isDirty: false,
  isSaving: false,
  presentationMode: false,
  saveHistory: () => {
    const { elements, past } = get();
    set({
      past: [...past.slice(-49), JSON.parse(JSON.stringify(elements))],
      future: []
    });
  },
  undo: () => {
    const { past, elements, future } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    set({
      past: past.slice(0, past.length - 1),
      elements: previous,
      future: [elements, ...future],
      isDirty: true
    });
  },
  redo: () => {
    const { past, elements, future } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      past: [...past, elements],
      elements: next,
      future: future.slice(1),
      isDirty: true
    });
  },
  setTool: (tool) => set({ currentTool: tool }),
  setSelection: (ids) => {
    if (ids === null) set({ selectedIds: [] });
    else if (Array.isArray(ids)) set({ selectedIds: ids });
    else set({ selectedIds: [ids] });
  },
  toggleSelection: (id) => {
    const { selectedIds } = get();
    if (selectedIds.includes(id)) {
      set({ selectedIds: selectedIds.filter(i => i !== id) });
    } else {
      set({ selectedIds: [...selectedIds, id] });
    }
  },
  setDesignName: (name) => set({ designName: name, isDirty: true }),
  addElement: (el) => {
    const id = nanoid();
    get().saveHistory();
    set((state) => ({
      elements: [...state.elements, { ...el, id }],
      selectedIds: [id],
      isDirty: true,
    }));
    return id;
  },
  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
      isDirty: true,
    }));
  },
  removeSelected: () => {
    const { selectedIds, elements } = get();
    if (selectedIds.length === 0) return;
    get().saveHistory();
    set({
      elements: elements.filter((el) => !selectedIds.includes(el.id)),
      selectedIds: [],
      isDirty: true,
    });
  },
  setElements: (elements) => set({ elements, isDirty: true }),
  nudgeElements: (dx, dy) => {
    const { selectedIds, elements } = get();
    if (selectedIds.length === 0) return;
    get().saveHistory();
    set({
      elements: elements.map(el => 
        selectedIds.includes(el.id) ? { ...el, x: el.x + dx, y: el.y + dy } : el
      ),
      isDirty: true
    });
  },
  duplicateSelected: () => {
    const { selectedIds, elements } = get();
    if (selectedIds.length === 0) return;
    get().saveHistory();
    const newElements: CanvasElement[] = [];
    const newSelectedIds: string[] = [];
    selectedIds.forEach(id => {
      const el = elements.find(e => e.id === id);
      if (el) {
        const newId = nanoid();
        newElements.push({ ...el, id: newId, x: el.x + 20, y: el.y + 20, name: `${el.name} Copy` });
        newSelectedIds.push(newId);
      }
    });
    set(state => ({
      elements: [...state.elements, ...newElements],
      selectedIds: newSelectedIds,
      isDirty: true
    }));
  },
  bringToFront: () => {
    const { selectedIds, elements } = get();
    if (selectedIds.length === 0) return;
    get().saveHistory();
    const selected = elements.filter(el => selectedIds.includes(el.id));
    const remaining = elements.filter(el => !selectedIds.includes(el.id));
    set({ elements: [...remaining, ...selected] });
  },
  sendToBack: () => {
    const { selectedIds, elements } = get();
    if (selectedIds.length === 0) return;
    get().saveHistory();
    const selected = elements.filter(el => selectedIds.includes(el.id));
    const remaining = elements.filter(el => !selectedIds.includes(el.id));
    set({ elements: [...selected, ...remaining] });
  },
  setCanvasTransform: (transform) => set((state) => ({
    canvasTransform: { ...state.canvasTransform, ...transform },
    isDirty: true,
  })),
  togglePresentationMode: () => set(state => ({ presentationMode: !state.presentationMode })),
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