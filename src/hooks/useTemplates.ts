import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BoardTemplate, Column, Task, Label } from '../types';
import * as db from '../lib/db';
import { BUILT_IN_TEMPLATES } from '../lib/templates';

export function useTemplates() {
  const [customTemplates, setCustomTemplates] = useState<BoardTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Load custom templates on mount
  useEffect(() => {
    loadCustomTemplates();
  }, []);

  const loadCustomTemplates = async () => {
    try {
      setLoading(true);
      const templates = await db.getAllTemplates();
      // Filter only custom (non-built-in) templates
      setCustomTemplates(templates.filter(t => !t.isBuiltIn));
    } catch (error) {
      console.error('Failed to load custom templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get all templates (built-in + custom)
  const getAllTemplates = useCallback((): BoardTemplate[] => {
    return [...BUILT_IN_TEMPLATES, ...customTemplates];
  }, [customTemplates]);

  // Save current board as a new template
  const saveCurrentBoardAsTemplate = useCallback(async (
    name: string,
    description: string,
    icon: string,
    columns: Column[],
    tasks: Map<string, Task[]>,
    labels: Label[]
  ): Promise<BoardTemplate> => {
    const now = Date.now();

    // Convert columns to template format
    const templateColumns = columns.map(col => ({
      title: col.title,
    }));

    // Convert labels to template format
    const templateLabels = labels.map(label => ({
      name: label.name,
      color: label.color,
    }));

    // Create label ID to index mapping for tasks
    const labelIdToIndex = new Map<string, number>();
    labels.forEach((label, index) => {
      labelIdToIndex.set(label.id, index);
    });

    // Create column ID to index mapping
    const columnIdToIndex = new Map<string, number>();
    columns.forEach((col, index) => {
      columnIdToIndex.set(col.id, index);
    });

    // Convert tasks to template format
    const templateTasks: Array<{
      title: string;
      description?: string;
      columnIndex: number;
      labelIndices: number[];
    }> = [];

    // Iterate through all columns and their tasks
    for (const column of columns) {
      const columnTasks = tasks.get(column.id) || [];
      const columnIndex = columnIdToIndex.get(column.id) ?? 0;

      for (const task of columnTasks) {
        templateTasks.push({
          title: task.title,
          description: task.description,
          columnIndex,
          labelIndices: task.labelIds
            .map(id => labelIdToIndex.get(id))
            .filter((idx): idx is number => idx !== undefined),
        });
      }
    }

    const template: BoardTemplate = {
      id: uuidv4(),
      name,
      description,
      icon,
      isBuiltIn: false,
      columns: templateColumns,
      labels: templateLabels,
      tasks: templateTasks,
      createdAt: now,
      updatedAt: now,
    };

    await db.saveTemplate(template);
    setCustomTemplates(prev => [...prev, template]);

    return template;
  }, []);

  // Update an existing custom template
  const updateTemplate = useCallback(async (
    id: string,
    updates: Partial<Pick<BoardTemplate, 'name' | 'description' | 'icon'>>
  ): Promise<void> => {
    const template = customTemplates.find(t => t.id === id);
    if (!template) {
      console.error('Template not found:', id);
      return;
    }

    const updated: BoardTemplate = {
      ...template,
      ...updates,
      updatedAt: Date.now(),
    };

    await db.saveTemplate(updated);
    setCustomTemplates(prev => prev.map(t => t.id === id ? updated : t));
  }, [customTemplates]);

  // Delete a custom template
  const deleteTemplate = useCallback(async (id: string): Promise<void> => {
    // Check if it's a built-in template
    const isBuiltIn = BUILT_IN_TEMPLATES.some(t => t.id === id);
    if (isBuiltIn) {
      console.error('Cannot delete built-in template');
      return;
    }

    await db.deleteTemplate(id);
    setCustomTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  // Duplicate a template (create a custom copy)
  const duplicateTemplate = useCallback(async (
    templateId: string,
    newName?: string
  ): Promise<BoardTemplate | null> => {
    // Find template in built-in or custom
    const template = 
      BUILT_IN_TEMPLATES.find(t => t.id === templateId) ||
      customTemplates.find(t => t.id === templateId);

    if (!template) {
      console.error('Template not found:', templateId);
      return null;
    }

    const now = Date.now();
    const duplicate: BoardTemplate = {
      ...template,
      id: uuidv4(),
      name: newName || `${template.name} (Copy)`,
      isBuiltIn: false,
      createdAt: now,
      updatedAt: now,
    };

    await db.saveTemplate(duplicate);
    setCustomTemplates(prev => [...prev, duplicate]);

    return duplicate;
  }, [customTemplates]);

  return {
    // State
    customTemplates,
    loading,

    // Computed
    getAllTemplates,
    builtInTemplates: BUILT_IN_TEMPLATES,

    // Operations
    saveCurrentBoardAsTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    reloadTemplates: loadCustomTemplates,
  };
}
