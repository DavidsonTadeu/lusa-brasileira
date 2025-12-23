// Conector Oficial Supabase - Lusa Brasileira v1.6 (Correção Notificações)
import { supabase } from './supabaseClient';

const TABLE_MAP = {
  User: 'app_users',
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

// Função de Limpeza Agressiva (Whitelist)
const sanitizePayload = (entityName, rawData) => {
  // 1. Definição das colunas PERMITIDAS (A Lista VIP)
  const WHITELISTS = {
    Booking: [
      'service_id', 'professional_id', 'user_id',
      'booking_date', 'booking_time',
      'client_name', 'client_email', 'client_phone', 'notes',
      'service_name', 'professional_name', 'duration_minutes',
      'status'
    ],
    // ADICIONEI ESTA LISTA AGORA:
    Notification: [
      'user_id',   // Quem recebe (ID do cliente ou prof-1)
      'type',      // info, success, warning
      'title',     // Título
      'message',   // Texto
      'read',      // Lido/Não lido
      'link'       // Link para onde vai ao clicar
    ],
    Service: [
      'name', 'description', 'category', 
      'duration_minutes', 'price', 'price_from', 
      'is_active', 'is_featured', 'requires_consultation'
    ]
  };

  // Se a tabela estiver na Lista VIP, usamos a limpeza estrita
  if (WHITELISTS[entityName]) {
    const cleanPayload = {};
    WHITELISTS[entityName].forEach(key => {
      if (rawData[key] !== undefined) {
        cleanPayload[key] = rawData[key];
      }
    });

    // Tratamentos de tipos
    if (entityName === 'Booking') {
      if (cleanPayload.duration_minutes) cleanPayload.duration_minutes = parseInt(cleanPayload.duration_minutes);
    }
    if (entityName === 'Service') {
       if (cleanPayload.price) cleanPayload.price = parseFloat(cleanPayload.price);
       if (cleanPayload.duration_minutes) cleanPayload.duration_minutes = parseInt(cleanPayload.duration_minutes);
       if (isNaN(cleanPayload.price)) delete cleanPayload.price;
       if (isNaN(cleanPayload.duration_minutes)) delete cleanPayload.duration_minutes;
    }

    return cleanPayload;
  }

  // --- Para tabelas comuns (limpeza padrão) ---
  const payload = { ...rawData };
  delete payload.id;
  delete payload.created_at;
  delete payload.created_date;

  if (entityName === 'GalleryImage') {
    if (payload.display_order) payload.display_order = parseInt(payload.display_order);
  }
  if (entityName === 'Review') {
    if (payload.rating) payload.rating = parseInt(payload.rating);
  }

  return payload;
};

export const base44 = {
  auth: {
    me: async () => {
      const user = localStorage.getItem('user_session');
      return user ? JSON.parse(user) : null;
    },
    
    login: async (email, password) => {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      const adminPass = import.meta.env.VITE_ADMIN_PASSWORD;

      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      if (cleanEmail === adminEmail?.toLowerCase() && cleanPass === adminPass) {
        const user = { id: 'prof-1', role: 'admin', full_name: 'Ingrid (Admin)', email: adminEmail };
        localStorage.setItem('user_session', JSON.stringify(user));
        return user;
      }

      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('email', cleanEmail)
        .eq('password', cleanPass) 
        .single();

      if (error || !data) {
        console.error("Erro Login:", error);
        throw new Error("Email ou senha incorretos.");
      }

      const userSafe = { ...data };
      delete userSafe.password;
      localStorage.setItem('user_session', JSON.stringify(userSafe));
      return userSafe;
    },

    register: async (data) => {
      const cleanEmail = data.email.trim().toLowerCase();
      
      const { data: existing } = await supabase
        .from('app_users')
        .select('id')
        .eq('email', cleanEmail)
        .single();

      if (existing) {
        throw new Error("Este email já está registado.");
      }

      const { data: newUser, error } = await supabase
        .from('app_users')
        .insert([{
          full_name: data.full_name,
          email: cleanEmail,
          password: data.password.trim(),
          role: 'client',
          phone: data.phone || ''
        }])
        .select()
        .single();

      if (error) {
        console.error("Erro Registo:", error);
        throw new Error("Erro ao criar conta.");
      }

      const userSafe = { ...newUser };
      delete userSafe.password;
      localStorage.setItem('user_session', JSON.stringify(userSafe));
      return userSafe;
    },

    logout: async () => {
      localStorage.removeItem('user_session');
      window.location.href = "/";
    }
  },

  entities: new Proxy({}, {
    get: (_, entityName) => ({
      list: async (sortParam) => {
        const tableName = TABLE_MAP[entityName];
        if (!tableName) return [];

        let query = supabase.from(tableName).select('*');
        
        if (sortParam) {
           const isDesc = sortParam.startsWith('-');
           const column = isDesc ? sortParam.substring(1) : sortParam;
           if (column === 'order') query = query.order('display_order', { ascending: true });
           else query = query.order(column, { ascending: !isDesc });
        }

        const { data, error } = await query;
        if (error) console.error(`Erro ao listar ${entityName}:`, error);
        return data || [];
      },
      
      filter: async (criteria) => {
        const tableName = TABLE_MAP[entityName];
        if (!tableName) return [];

        let query = supabase.from(tableName).select('*');

        Object.keys(criteria).forEach(key => {
          const value = criteria[key];
          
          if (key === 'email') {
             query = query.eq('email', value.toLowerCase());
          } else if (typeof value === 'object' && value?.$in) {
             query = query.in(key, value.$in);
          } else {
             query = query.eq(key, value);
          }
        });

        const { data, error } = await query;
        return data || [];
      },

      create: async (itemData) => {
        const tableName = TABLE_MAP[entityName];
        const payload = sanitizePayload(entityName, itemData);
        
        console.log(`Tentando criar em ${tableName}:`, payload);

        const { data, error } = await supabase
          .from(tableName)
          .insert([payload])
          .select()
          .single();

        if (error) {
            console.error(`Erro fatal ao criar ${entityName}:`, error);
            throw error;
        }
        return data;
      },
      
      update: async (id, itemData) => {
        const tableName = TABLE_MAP[entityName];
        const payload = sanitizePayload(entityName, itemData);

        console.log(`Tentando atualizar ${tableName} ID ${id}:`, payload);

        const { data, error } = await supabase
          .from(tableName)
          .update(payload)
          .eq('id', id)
          .select()
          .single();
          
        if (error) {
            console.error(`Erro fatal ao atualizar ${entityName}:`, error);
            throw error;
        }
        return data;
      },
      
      delete: async (id) => {
        const tableName = TABLE_MAP[entityName];
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id);
          
        if (error) console.error(`Erro ao deletar ${entityName}:`, error);
        return !error;
      }
    })
  }),

  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        return { file_url: URL.createObjectURL(file) };
      }
    }
  }
};