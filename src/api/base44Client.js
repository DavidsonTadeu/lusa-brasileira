import { supabase } from './supabaseClient';

// --- MAPEAMENTO DE TABELAS ---
const TABLE_MAP = {
  User: 'professionals', 
  Professional: 'professionals',
  Booking: 'bookings',
  Service: 'services',
  GalleryImage: 'gallery_images',
  Review: 'reviews',
  BlockedSlot: 'blocked_slots',
  Notification: 'notifications',
  Announcement: 'announcements',
  ContactMessage: 'contact_messages'
};

const preventCrash = (entityName, data) => {
  if (!data) return [];
  const list = Array.isArray(data) ? data : [data];
  
  const futureDate = "2030-01-01T12:00:00.000Z";
  const pastDate = "2024-01-01T12:00:00.000Z";

  return list.map(item => {
    const safeItem = { ...item };

    if (entityName === 'Announcement') {
      if (!safeItem.expires_at) safeItem.expires_at = futureDate;
      if (safeItem.content && !safeItem.message) safeItem.message = safeItem.content;
      if (safeItem.priority && !safeItem.type) safeItem.type = safeItem.priority;
    }

    if (['Notification', 'Booking', 'ContactMessage'].includes(entityName)) {
         if (!safeItem.created_at) safeItem.created_at = pastDate;
         if (!safeItem.created_date) safeItem.created_date = pastDate;
         
         if (entityName === 'Booking') {
            if (!safeItem.booking_date) safeItem.booking_date = pastDate.split('T')[0];
            if (!safeItem.booking_time) safeItem.booking_time = "12:00";
         }
    }

    return safeItem;
  });
};

const sanitizePayload = (entityName, rawData) => {
  const payload = { ...rawData };
  delete payload.id;
  
  if (entityName === 'Booking') {
      if (payload.duration_minutes) payload.duration_minutes = parseInt(payload.duration_minutes);
      if (payload.booking_date) {
          payload.booking_date = String(payload.booking_date).substring(0, 10);
      }
  }

  if (entityName === 'Announcement') {
      if (!payload.expires_at) {
          const d = new Date();
          d.setDate(d.getDate() + 7);
          payload.expires_at = d.toISOString();
      }
      if (!payload.type) payload.type = 'info';
  }
  
  if (entityName === 'GalleryImage' && payload.display_order) {
      payload.display_order = parseInt(payload.display_order);
  }

  return payload;
};

export const base44 = {
  auth: {
    me: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      const { data } = await supabase.from('professionals').select('*').eq('email', session.user.email).single();
      
      if (data) return data;
      if (session.user.email?.toLowerCase() === adminEmail?.toLowerCase()) {
          return { id: session.user.id, role: 'admin', full_name: 'Administrador', email: adminEmail };
      }
      return { id: session.user.id, email: session.user.email, role: 'client' };
    },
    
    login: async (email, password) => {
      // Login utilizando Supabase Auth (Seguro, sem senhas no frontend)
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw new Error("Credenciais inválidas ou conta inexistente.");
      
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      const { data: profData } = await supabase.from('professionals').select('*').eq('email', email).single();
      
      if (profData) return profData;
      if (email.trim().toLowerCase() === adminEmail?.toLowerCase()) {
        return { id: authData.user.id, role: 'admin', full_name: 'Administrador', email };
      }

      return { id: authData.user.id, email: authData.user.email, role: 'client' };
    },

    register: async (userData) => {
      // Registra o usuário no sistema de autenticação oficial do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) throw new Error("Erro ao criar conta: " + authError.message);

      // Verifica se o email já existe na tabela professionals (redundância)
      const { data: existing } = await supabase
        .from('professionals')
        .select('id')
        .eq('email', userData.email);

      if (existing && existing.length > 0) {
        throw new Error("Este e-mail já está registado nos perfis.");
      }

      // Prepara os dados do novo cliente
      const newClient = {
        full_name: userData.full_name,
        email: userData.email,
        password: userData.password, // Mantido apenas para compatibilidade legada com rotinas antigas, caso existam
        role: 'client',
        phone: '',
        preferences: '',
        allergies: ''
      };

      const { data, error } = await supabase
        .from('professionals')
        .insert([newClient])
        .select()
        .single();

      if (error) throw new Error("Erro ao salvar perfil: " + error.message);
      
      return data;
    },

    logout: async () => { 
        await supabase.auth.signOut(); 
        window.location.href = "/"; 
    }
  },

  entities: new Proxy({}, {
    get: (_, entityName) => ({
      list: async (sortParam) => {
        const table = TABLE_MAP[entityName];
        if (!table) return [];
        
        let query = supabase.from(table).select('*');
        
        if (sortParam) {
            let col = sortParam.replace('-', '');
            if (col === 'order') col = 'display_order';
            if (!col.includes('date') && !col.includes('expires')) {
                try { query = query.order(col, { ascending: !sortParam.startsWith('-') }); } catch(e){}
            }
        }

        const { data, error } = await query;
        if (error) { console.error(error); return []; }
        return preventCrash(entityName, data);
      },
      create: async (item) => {
          const table = TABLE_MAP[entityName];
          const payload = sanitizePayload(entityName, item);
          const { data, error } = await supabase.from(table).insert([payload]).select().single();
          if(error) throw error;
          return data;
      },
      update: async (id, item) => {
          const table = TABLE_MAP[entityName];
          const payload = sanitizePayload(entityName, item);
          const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
          if(error) throw error;
          return data;
      },
      delete: async (id) => {
          const table = TABLE_MAP[entityName];
          await supabase.from(table).delete().eq('id', id);
          return true;
      },
      filter: async (c) => {
          let q = supabase.from(TABLE_MAP[entityName]).select('*');
          Object.keys(c).forEach(k => q = q.eq(k, c[k]));
          const { data } = await q;
          return preventCrash(entityName, data);
      }
    })
  }),
  integrations: { Core: { UploadFile: async ({ file }) => ({ file_url: URL.createObjectURL(file) }) } }
};