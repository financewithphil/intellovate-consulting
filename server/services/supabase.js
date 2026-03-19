import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

// Gracefully handle missing Supabase config (dev mode uses in-memory fallback)
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export default supabase;

// In-memory store for development without Supabase
const memStore = {
  clients: [],
  audits: [],
  workflows: [],
  grants: [],
  leads: [],
  reports: []
};

let idCounter = 1;

export function getStore(table) {
  if (!memStore[table]) memStore[table] = [];
  return memStore[table];
}

export function memInsert(table, data) {
  const record = { id: idCounter++, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  getStore(table).push(record);
  return record;
}

export function memUpdate(table, id, data) {
  const store = getStore(table);
  const idx = store.findIndex(r => r.id === Number(id));
  if (idx === -1) return null;
  store[idx] = { ...store[idx], ...data, updated_at: new Date().toISOString() };
  return store[idx];
}

export function memDelete(table, id) {
  const store = getStore(table);
  const idx = store.findIndex(r => r.id === Number(id));
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function memFind(table, filter = {}) {
  let results = getStore(table);
  for (const [key, value] of Object.entries(filter)) {
    results = results.filter(r => r[key] === value);
  }
  return results;
}

export function memFindById(table, id) {
  return getStore(table).find(r => r.id === Number(id)) || null;
}

// Unified DB helper — uses Supabase if available, falls back to in-memory
export const db = {
  async select(table, filter = {}) {
    if (supabase) {
      let query = supabase.from(table).select('*');
      for (const [key, value] of Object.entries(filter)) {
        query = query.eq(key, value);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
    return memFind(table, filter);
  },

  async selectById(table, id) {
    if (supabase) {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    }
    return memFindById(table, id);
  },

  async insert(table, data) {
    if (supabase) {
      const { data: result, error } = await supabase.from(table).insert(data).select().single();
      if (error) throw error;
      return result;
    }
    return memInsert(table, data);
  },

  async update(table, id, data) {
    if (supabase) {
      const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    }
    return memUpdate(table, id, data);
  },

  async delete(table, id) {
    if (supabase) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return true;
    }
    return memDelete(table, id);
  }
};
