import { useState } from 'react';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, GripVertical, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getData, setData } from '@/lib/mock-data';
import { ModifierGroup, ModifierOption } from '@/lib/types';
import { formatCFA } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';

const emptyGroup: Partial<ModifierGroup> = {
  name: '', required: false, multiSelect: false, minSelections: 0, maxSelections: 1, options: [],
};

export default function ModifiersPage() {
  const { toast } = useToast();
  const [groups, setGroups] = useState(() => getData<ModifierGroup[]>('modifierGroups'));
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editGroup, setEditGroup] = useState<Partial<ModifierGroup>>(emptyGroup);
  const [showOptionForm, setShowOptionForm] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [editOption, setEditOption] = useState<Partial<ModifierOption>>({ name: '', price: 0 });

  const toggleExpand = (id: string) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const saveGroup = () => {
    if (!editGroup.name) return;
    const isNew = !editGroup.id;
    const group: ModifierGroup = {
      id: editGroup.id || `mod-${Math.random().toString(36).slice(2)}`,
      name: editGroup.name!,
      required: editGroup.required ?? false,
      multiSelect: editGroup.multiSelect ?? false,
      minSelections: editGroup.minSelections ?? 0,
      maxSelections: editGroup.maxSelections ?? 1,
      options: editGroup.options ?? [],
    };
    const updated = isNew ? [...groups, group] : groups.map(g => g.id === group.id ? group : g);
    setGroups(updated);
    setData('modifierGroups', updated);
    setShowGroupForm(false);
    setEditGroup(emptyGroup);
    toast({ title: isNew ? 'Modifier group created' : 'Modifier group updated' });
  };

  const deleteGroup = (id: string) => {
    const updated = groups.filter(g => g.id !== id);
    setGroups(updated);
    setData('modifierGroups', updated);
    toast({ title: 'Modifier group deleted' });
  };

  const openOptionForm = (groupId: string, option?: ModifierOption) => {
    setActiveGroupId(groupId);
    setEditOption(option ? { ...option } : { name: '', price: 0 });
    setShowOptionForm(true);
  };

  const saveOption = () => {
    if (!editOption.name || !activeGroupId) return;
    const isNew = !editOption.id;
    const option: ModifierOption = {
      id: editOption.id || `mopt-${Math.random().toString(36).slice(2)}`,
      name: editOption.name!,
      price: editOption.price ?? 0,
    };
    const updated = groups.map(g => {
      if (g.id !== activeGroupId) return g;
      const options = isNew ? [...g.options, option] : g.options.map(o => o.id === option.id ? option : o);
      return { ...g, options };
    });
    setGroups(updated);
    setData('modifierGroups', updated);
    setShowOptionForm(false);
    setEditOption({ name: '', price: 0 });
    toast({ title: isNew ? 'Option added' : 'Option updated' });
  };

  const deleteOption = (groupId: string, optionId: string) => {
    const updated = groups.map(g => {
      if (g.id !== groupId) return g;
      return { ...g, options: g.options.filter(o => o.id !== optionId) };
    });
    setGroups(updated);
    setData('modifierGroups', updated);
    toast({ title: 'Option deleted' });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Modifiers</h1>
          <p className="text-muted-foreground text-sm">Create modifier groups (Size, Extras) and add options to customize items</p>
        </div>
        <Button className="gap-2" onClick={() => { setEditGroup(emptyGroup); setShowGroupForm(true); }}>
          <Plus className="h-4 w-4" />Add Modifier Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Tag className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No modifier groups yet</p>
            <p className="text-sm">Create your first modifier group like "Size" or "Extras"</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {groups.map(group => (
            <Card key={group.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <button
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => toggleExpand(group.id)}
                  >
                    {expanded[group.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                  <CardTitle className="text-base flex-1">{group.name}</CardTitle>
                  <div className="flex gap-2 items-center">
                    {group.required && <Badge variant="default" className="text-xs">Required</Badge>}
                    {group.multiSelect && <Badge variant="secondary" className="text-xs">Multi-select</Badge>}
                    <Badge variant="outline" className="text-xs">{group.options.length} options</Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditGroup({ ...group }); setShowGroupForm(true); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Delete "{group.name}"?</AlertDialogTitle><AlertDialogDescription>This will remove this modifier group and all its options.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => deleteGroup(group.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>

              {expanded[group.id] && (
                <CardContent className="pt-0 pl-12">
                  <div className="space-y-2 mb-3">
                    {group.options.map(opt => (
                      <div key={opt.id} className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30">
                        <GripVertical className="h-3 w-3 text-muted-foreground/40" />
                        <span className="flex-1 text-sm font-medium">{opt.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {opt.price > 0 ? `+${formatCFA(opt.price)}` : 'Free'}
                        </span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openOptionForm(group.id, opt)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteOption(group.id, opt.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openOptionForm(group.id)}>
                    <Plus className="h-3 w-3" />Add Option
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Group Form */}
      <Dialog open={showGroupForm} onOpenChange={setShowGroupForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editGroup.id ? 'Edit Modifier Group' : 'New Modifier Group'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Group Name *</Label>
              <Input placeholder="e.g. Size, Extras, Cooking" value={editGroup.name} onChange={e => setEditGroup({ ...editGroup, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={editGroup.required} onCheckedChange={v => setEditGroup({ ...editGroup, required: v })} />
                <Label>Required</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editGroup.multiSelect} onCheckedChange={v => setEditGroup({ ...editGroup, multiSelect: v })} />
                <Label>Multi-select</Label>
              </div>
            </div>
            {editGroup.multiSelect && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Min Selections</Label>
                  <Input type="number" min="0" value={editGroup.minSelections} onChange={e => setEditGroup({ ...editGroup, minSelections: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <Label>Max Selections</Label>
                  <Input type="number" min="1" value={editGroup.maxSelections} onChange={e => setEditGroup({ ...editGroup, maxSelections: parseInt(e.target.value) || 1 })} />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowGroupForm(false)}>Cancel</Button>
              <Button onClick={saveGroup}>Save Group</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Option Form */}
      <Dialog open={showOptionForm} onOpenChange={setShowOptionForm}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editOption.id ? 'Edit Option' : 'Add Option'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Option Name *</Label>
              <Input placeholder="e.g. Small, Extra Shot" value={editOption.name} onChange={e => setEditOption({ ...editOption, name: e.target.value })} />
            </div>
            <div>
              <Label>Additional Price (FCFA)</Label>
              <Input type="number" min="0" step="50" placeholder="0 = Free" value={editOption.price} onChange={e => setEditOption({ ...editOption, price: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowOptionForm(false)}>Cancel</Button>
              <Button onClick={saveOption}>Save Option</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
