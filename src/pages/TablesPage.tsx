import { useState } from 'react';
import { Plus, Edit, Trash2, Users, Clock, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getData, setData } from '@/lib/mock-data';
import { Table, TableSection } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const statusConfig = {
  available: { label: 'Available', color: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700', badge: 'outline' as const, dot: 'bg-green-500' },
  occupied: { label: 'Occupied', color: 'bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700', badge: 'default' as const, dot: 'bg-orange-500' },
  reserved: { label: 'Reserved', color: 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700', badge: 'secondary' as const, dot: 'bg-blue-500' },
};

export default function TablesPage() {
  const { toast } = useToast();
  const [tables, setTables] = useState(() => getData<Table[]>('tables'));
  const [sections, setSections] = useState(() => getData<TableSection[]>('tableSections'));
  const [showTableForm, setShowTableForm] = useState(false);
  const [editTable, setEditTable] = useState<Partial<Table>>({ name: '', sectionId: '', seats: 4, status: 'available' });
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editSection, setEditSection] = useState<Partial<TableSection>>({ name: '' });

  const saveTable = () => {
    if (!editTable.name || !editTable.sectionId) return;
    const isNew = !editTable.id;
    const table: Table = {
      id: editTable.id || `tbl-${Math.random().toString(36).slice(2)}`,
      name: editTable.name!,
      sectionId: editTable.sectionId!,
      seats: editTable.seats ?? 4,
      status: editTable.status ?? 'available',
    };
    const updated = isNew ? [...tables, table] : tables.map(t => t.id === table.id ? table : t);
    setTables(updated);
    setData('tables', updated);
    setShowTableForm(false);
    setEditTable({ name: '', sectionId: '', seats: 4, status: 'available' });
    toast({ title: isNew ? 'Table added' : 'Table updated' });
  };

  const deleteTable = (id: string) => {
    const updated = tables.filter(t => t.id !== id);
    setTables(updated);
    setData('tables', updated);
    toast({ title: 'Table deleted' });
  };

  const setTableStatus = (id: string, status: Table['status']) => {
    const updated = tables.map(t => t.id === id ? {
      ...t,
      status,
      openedAt: status === 'occupied' ? new Date().toISOString() : undefined,
      guestCount: status === 'available' ? undefined : t.guestCount,
    } : t);
    setTables(updated);
    setData('tables', updated);
  };

  const saveSection = () => {
    if (!editSection.name) return;
    const isNew = !editSection.id;
    const section: TableSection = { id: editSection.id || `sec-${Math.random().toString(36).slice(2)}`, name: editSection.name! };
    const updated = isNew ? [...sections, section] : sections.map(s => s.id === section.id ? section : s);
    setSections(updated);
    setData('tableSections', updated);
    setShowSectionForm(false);
    setEditSection({ name: '' });
    toast({ title: isNew ? 'Section created' : 'Section updated' });
  };

  const deleteSection = (id: string) => {
    const updated = sections.filter(s => s.id !== id);
    setSections(updated);
    setData('tableSections', updated);
  };

  const formatTime = (iso?: string) => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`;
  };

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tables</h1>
          <p className="text-muted-foreground text-sm">Floor plan management for dine-in service</p>
        </div>
        <Button className="gap-2" onClick={() => { setEditTable({ name: '', sectionId: sections[0]?.id || '', seats: 4, status: 'available' }); setShowTableForm(true); }}>
          <Plus className="h-4 w-4" />Add Table
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground' },
          { label: 'Available', value: stats.available, color: 'text-green-600' },
          { label: 'Occupied', value: stats.occupied, color: 'text-orange-600' },
          { label: 'Reserved', value: stats.reserved, color: 'text-blue-600' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue={sections[0]?.id || 'all'}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Sections</TabsTrigger>
            {sections.map(s => (
              <TabsTrigger key={s.id} value={s.id}>{s.name}</TabsTrigger>
            ))}
          </TabsList>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => { setEditSection({ name: '' }); setShowSectionForm(true); }}>
            <Plus className="h-3 w-3" />Section
          </Button>
        </div>

        {(['all', ...sections.map(s => s.id)] as string[]).map(sectionId => (
          <TabsContent key={sectionId} value={sectionId}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tables
                .filter(t => sectionId === 'all' || t.sectionId === sectionId)
                .map(t => {
                  const cfg = statusConfig[t.status];
                  return (
                    <div
                      key={t.id}
                      className={cn('border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md', cfg.color)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-lg">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{sections.find(s => s.id === t.sectionId)?.name}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 -mr-1 -mt-1" onClick={e => { e.stopPropagation(); setEditTable({ ...t }); setShowTableForm(true); }}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                        <Users className="h-3.5 w-3.5" />
                        <span>{t.seats} seats</span>
                        {t.guestCount && <span className="text-orange-600 font-medium ml-1">({t.guestCount} guests)</span>}
                      </div>

                      {t.status === 'occupied' && t.openedAt && (
                        <div className="flex items-center gap-1 text-xs text-orange-600 mb-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatTime(t.openedAt)}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 mb-3">
                        <div className={cn('h-2 w-2 rounded-full', cfg.dot)} />
                        <span className="text-xs font-medium">{cfg.label}</span>
                      </div>

                      <Select value={t.status} onValueChange={v => setTableStatus(t.id, v as Table['status'])}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="occupied">Occupied</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Table Form */}
      <Dialog open={showTableForm} onOpenChange={setShowTableForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editTable.id ? 'Edit Table' : 'Add Table'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Table Name *</Label>
              <Input placeholder="e.g. T1, Table 5, Bar 3" value={editTable.name} onChange={e => setEditTable({ ...editTable, name: e.target.value })} />
            </div>
            <div>
              <Label>Section *</Label>
              <Select value={editTable.sectionId} onValueChange={v => setEditTable({ ...editTable, sectionId: v })}>
                <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                <SelectContent>{sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Seats</Label>
              <Input type="number" min="1" max="30" value={editTable.seats} onChange={e => setEditTable({ ...editTable, seats: parseInt(e.target.value) || 4 })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={editTable.status} onValueChange={v => setEditTable({ ...editTable, status: v as Table['status'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowTableForm(false)}>Cancel</Button>
              {editTable.id && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-destructive">Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Delete {editTable.name}?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { deleteTable(editTable.id!); setShowTableForm(false); }}>Delete</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button onClick={saveTable}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Section Form */}
      <Dialog open={showSectionForm} onOpenChange={setShowSectionForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editSection.id ? 'Edit Section' : 'New Section'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Section Name *</Label>
              <Input placeholder="e.g. Main Hall, Terrace, VIP" value={editSection.name} onChange={e => setEditSection({ ...editSection, name: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSectionForm(false)}>Cancel</Button>
              {editSection.id && (
                <Button variant="outline" className="text-destructive" onClick={() => { deleteSection(editSection.id!); setShowSectionForm(false); }}>Delete</Button>
              )}
              <Button onClick={saveSection}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
