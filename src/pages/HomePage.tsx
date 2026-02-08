import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Clock, FileCode, Layers, Zap, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api-client';
import type { Design } from '@shared/types';
import { formatDistanceToNow } from 'date-fns';
export function HomePage() {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const res = await api<{ items: Design[] }>('/api/designs');
        setDesigns(res.items);
      } catch (err) {
        console.error('Failed to fetch designs:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDesigns();
  }, []);
  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const design = await api<Design>('/api/designs', {
        method: 'POST',
        body: JSON.stringify({ name: 'Untitled Design' }),
      });
      navigate(`/editor/${design.id}`);
    } catch (err) {
      console.error('Failed to create design:', err);
      setIsCreating(false);
    }
  };
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api(`/api/designs/${id}`, { method: 'DELETE' });
      setDesigns(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12 flex flex-col gap-12">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Layers className="w-6 h-6 text-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">DesignFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle className="relative top-0 right-0" />
              <div className="w-8 h-8 rounded-full bg-muted border border-border" />
            </div>
          </header>
          <section className="bg-muted/50 border border-border rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <Zap className="w-3 h-3" /> Professional Vector Tool
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Design with <span className="text-blue-500">precision</span>,<br /> create with ease.
              </h1>
              <p className="text-muted-foreground text-lg">
                Infinite canvas, professional manipulation tools, and cloud persistence.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <Button 
                  onClick={handleCreate} 
                  disabled={isCreating}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-foreground gap-2 h-12 px-6 rounded-xl"
                >
                  {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  New Design File
                </Button>
                <Button variant="outline" size="lg" className="border-border hover:bg-muted h-12 px-6 rounded-xl">
                  Import SVG
                </Button>
              </div>
            </div>
          </section>
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" /> Recent Files
              </h2>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="aspect-video bg-muted animate-pulse rounded-xl border border-border" />)}
              </div>
            ) : designs.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl text-muted-foreground">
                <FileCode className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No designs yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {designs.map((design) => (
                  <Link key={design.id} to={`/editor/${design.id}`}>
                    <Card className="bg-card border-border hover:border-accent transition-all cursor-pointer group">
                      <CardContent className="p-0">
                        <div className="aspect-video bg-muted rounded-t-xl overflow-hidden relative flex items-center justify-center">
                          <FileCode className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm group-hover:text-blue-400 transition-colors truncate">{design.name}</p>
                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(design.updatedAt)} ago</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => handleDelete(design.id, e)}
                            className="h-8 w-8 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}