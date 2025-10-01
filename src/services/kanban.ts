import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { KanbanCard, ProductionStatus } from '../types';

type ColumnState = {
  status: ProductionStatus;
  cards: KanbanCard[];
};

export class KanbanService {
  private client: SupabaseClient | null;
  private tableName: string;

  constructor() {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    this.tableName = import.meta.env.VITE_SUPABASE_KANBAN_TABLE || 'production_projects';

    if (!url || !key) {
      console.warn('[KanbanService] Supabase credentials are not configured.');
      this.client = null;
      return;
    }

    this.client = createClient(url, key);
  }

  async persistColumns(columns: ColumnState[]): Promise<void> {
    if (!this.client) {
      console.warn('[KanbanService] Supabase client is not configured. Skipping persistence.');
      return;
    }

    const updates = columns.flatMap(column =>
      column.cards.map((card, index) => ({
        id: card.id,
        status: card.status,
        position: index,
        updated_at: new Date().toISOString()
      }))
    );

    if (updates.length === 0) {
      return;
    }

    const { error } = await this.client
      .from(this.tableName)
      .upsert(updates, { onConflict: 'id' });

    if (error) {
      throw new Error(error.message);
    }
  }
}
