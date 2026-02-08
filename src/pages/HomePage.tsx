import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, FileCode, Layers, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardContent } from '@/components/ui/card';
const mockRecents = [
  { id: '1', name: 'Mobile App Wireframe', date: '2 hours ago', color: 'bg-blue-500' },
  { id: '2', name: 'Brand Identity Guidelines', date: 'Yesterday', color: 'bg-purple-500' },
  { id: '3', name: 'Marketing Dashboard', date: '3 days ago', color: 'bg-emerald-500' },
];
export function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12 flex flex-col gap-12">
          {/* Header */}
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">DesignFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle className="relative top-0 right-0" />
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700" />
            </div>
          </header>
          {/* Hero / CTA */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 md:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/5 blur-[100px] pointer-events-none" />
            <div className="relative z-10 max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <Zap className="w-3 h-3" /> Now in Beta
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Design with <span className="text-blue-500">precision</span>,<br /> create with ease.
              </h1>
              <p className="text-zinc-400 text-lg">
                The next generation vector design tool for teams. High performance infinite canvas, directly in your browser.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <Link to="/editor">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-12 px-6 rounded-xl">
                    <Plus className="w-5 h-5" /> New Design File
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-zinc-700 hover:bg-zinc-800 h-12 px-6 rounded-xl">
                  Import SVG
                </Button>
              </div>
            </div>
          </section>
          {/* Recent Files */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-zinc-500" /> Recent Files
              </h2>
              <Button variant="link" className="text-zinc-500 hover:text-white text-sm">View all</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockRecents.map((file) => (
                <Link key={file.id} to="/editor">
                  <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer group">
                    <CardContent className="p-0">
                      <div className="aspect-video bg-zinc-800 rounded-t-xl overflow-hidden relative">
                        <div className={`absolute inset-0 opacity-20 ${file.color}`} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FileCode className="w-12 h-12 text-zinc-600 group-hover:scale-110 transition-transform" />
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm group-hover:text-blue-400 transition-colors">{file.name}</p>
                          <p className="text-xs text-zinc-500">{file.date}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-white">
                          <Plus className="w-4 h-4 rotate-45" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}