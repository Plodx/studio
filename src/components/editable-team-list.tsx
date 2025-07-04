
'use client';

import type React from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X as LucideX, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface EditableTeamListProps {
  listId: string;
  title: string;
  description?: string;
  teams: string[];
  onTeamsChange: (newTeams: string[]) => void;
  inputLabel: string;
  addButtonLabel: string;
  nounSingular: string;
  nounPlural: string;
}

export function EditableTeamList({
  listId,
  title,
  description,
  teams,
  onTeamsChange,
  inputLabel,
  addButtonLabel,
  nounSingular,
  nounPlural,
}: EditableTeamListProps) {
  const [newItem, setNewItem] = useState('');

  const handleAddItem = () => {
    const trimmedItem = newItem.trim();
    if (trimmedItem && !teams.find(t => t.toLowerCase() === trimmedItem.toLowerCase())) {
      onTeamsChange([...teams, trimmedItem]);
      setNewItem('');
    }
    // Consider adding a toast notification for duplicate or empty input
  };

  const handleRemoveItem = (itemToRemove: string) => {
    onTeamsChange(teams.filter((item) => item !== itemToRemove));
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-card-foreground mb-2">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
        <div className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-grow space-y-1">
              <Label htmlFor={`${listId}-input`} className="text-sm font-medium text-card-foreground sr-only">{inputLabel}</Label>
              <Input
                id={`${listId}-input`}
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder={`Enter a new ${nounSingular}...`}
                className="text-sm bg-input text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem();
                  }
                }}
              />
            </div>
            <Button onClick={handleAddItem} variant="outline" size="icon" aria-label={addButtonLabel} className="shrink-0">
              <PlusCircle className="h-5 w-5 text-primary" />
            </Button>
          </div>

          {teams.length > 0 ? (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Current {nounPlural} ({teams.length}):
              </p>
              <div className="flex flex-wrap gap-2 p-2 rounded-md max-h-48 overflow-y-auto bg-background/50 border border-input">
                {teams.map((item) => (
                  <Badge key={item} variant="secondary" className="text-sm py-1 px-2.5 font-normal">
                    {item}
                    <button
                      onClick={() => handleRemoveItem(item)}
                      className="ml-1.5 p-0.5 rounded-full hover:bg-destructive/20 text-destructive focus:outline-none focus:ring-1 focus:ring-destructive"
                      aria-label={`Remove ${item}`}
                    >
                      <LucideX className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic pt-2">No {nounPlural} added yet.</p>
          )}
        </div>
    </div>
  );
}
