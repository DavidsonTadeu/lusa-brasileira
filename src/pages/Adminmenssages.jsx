import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Mail, Phone, Calendar, Trash2, Eye, Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export default function AdminMessages() {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const queryClient = useQueryClient();

  // Busca mensagens ordenadas por data (mais recentes primeiro)
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      const data = await base44.entities.ContactMessage.list();
      // Ordenação manual por segurança
      return data.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    },
  });

  // Marcar como lida
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ContactMessage.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      // Atualiza o contador no menu lateral se houver
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] }); 
    },
  });

  // Apagar mensagem
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ContactMessage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      setSelectedMessage(null);
    },
  });

  const handleOpenMessage = (msg) => {
    setSelectedMessage(msg);
    if (msg.status === 'new') {
      updateStatusMutation.mutate({ id: msg.id, status: 'read' });
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation(); // Impede de abrir o modal ao clicar no lixo
    if (window.confirm("Tem a certeza que deseja apagar esta mensagem?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatDateSafe = (dateString) => {
    try {
      if (!dateString) return "Data desconhecida";
      return format(new Date(dateString), "dd 'de' MMM 'às' HH:mm", { locale: pt });
    } catch (e) {
      return "Data inválida";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 text-gray-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif text-white mb-2">Caixa de Entrada</h1>
            <p className="text-gray-400">Gerencie dúvidas e contactos recebidos pelo site.</p>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
             <span className="text-sm text-gray-400">Total: <strong className="text-white">{messages.length}</strong></span>
          </div>
        </div>

        {/* Lista de Mensagens */}
        <div className="space-y-3">
          {isLoading ? (
             <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-700">
              <div className="bg-gray-800 p-4 rounded-full inline-block mb-4">
                 <Mail className="w-12 h-12 text-gray-600" />
              </div>
              <p className="text-gray-400 text-lg font-medium">Sua caixa de entrada está vazia.</p>
              <p className="text-gray-600 text-sm">Novas mensagens aparecerão aqui.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <Card 
                key={msg.id} 
                className={`
                  group p-5 border transition-all cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-lg
                  ${msg.status === 'new' 
                    ? 'bg-gray-800 border-l-4 border-l-[var(--primary)] border-t-gray-700 border-b-gray-700 border-r-gray-700' 
                    : 'bg-gray-900 border-gray-800 opacity-70 hover:opacity-100 hover:bg-gray-800'
                  }
                `}
                onClick={() => handleOpenMessage(msg)}
              >
                {/* Conteúdo Esquerda */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    {msg.status === 'new' && (
                      <span className="px-2 py-0.5 bg-[var(--primary)] text-white text-[10px] font-bold uppercase tracking-wider rounded-sm animate-pulse">
                        Nova
                      </span>
                    )}
                    <h3 className={`text-lg font-bold truncate ${msg.status === 'new' ? 'text-white' : 'text-gray-400'}`}>
                      {msg.name || "Sem Nome"}
                    </h3>
                    <span className="text-gray-600 text-xs hidden md:inline">•</span>
                    <span className="text-gray-500 text-xs flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDateSafe(msg.created_at)}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 text-sm truncate flex items-center gap-2">
                     <Mail className="w-3 h-3" /> {msg.email || "Sem Email"}
                  </p>
                  
                  <div className="mt-3 text-gray-300 text-sm line-clamp-1 italic bg-black/20 p-2 rounded border border-white/5">
                    <MessageSquare className="w-3 h-3 inline mr-2 opacity-50" />
                    "{msg.message || "..."}"
                  </div>
                </div>

                {/* Ações Direita */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <Eye className="w-4 h-4 mr-2" /> Ler
                  </Button>
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => handleDelete(e, msg.id)}
                    className="text-gray-600 hover:text-red-500 hover:bg-red-900/10 transition-colors"
                    title="Apagar Mensagem"
                  >
                     {deleteMutation.isPending && deleteMutation.variables === msg.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                     ) : (
                        <Trash2 className="w-4 h-4" />
                     )}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* --- MODAL DE LEITURA --- */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-lg shadow-2xl">
          <DialogHeader className="border-b border-gray-700 pb-4">
            <DialogTitle className="text-xl font-serif flex items-center gap-2">
              <div className="p-2 bg-[var(--primary)]/20 rounded-full text-[var(--primary)]">
                 <Mail className="w-5 h-5" />
              </div>
              Mensagem de Contato
            </DialogTitle>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-6 py-4">
              
              {/* Remetente Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                  <p className="text-gray-500 text-xs uppercase font-bold mb-1">Nome</p>
                  <p className="text-white font-medium">{selectedMessage.name}</p>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
                  <p className="text-gray-500 text-xs uppercase font-bold mb-1">Data</p>
                  <p className="text-white font-medium">{formatDateSafe(selectedMessage.created_at)}</p>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 sm:col-span-2">
                  <p className="text-gray-500 text-xs uppercase font-bold mb-1">Contatos</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                     <span className="flex items-center gap-2 text-sm text-blue-400 hover:underline cursor-pointer">
                        <Mail className="w-4 h-4" /> {selectedMessage.email}
                     </span>
                     {selectedMessage.phone && (
                       <span className="flex items-center gap-2 text-sm text-green-400 hover:underline cursor-pointer">
                          <Phone className="w-4 h-4" /> {selectedMessage.phone}
                       </span>
                     )}
                  </div>
                </div>
              </div>

              {/* Corpo da Mensagem */}
              <div className="space-y-2">
                 <p className="text-gray-500 text-xs uppercase font-bold">Mensagem Enviada</p>
                 <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 min-h-[100px]">
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
                      {selectedMessage.message}
                    </p>
                 </div>
              </div>

            </div>
          )}

          <DialogFooter className="border-t border-gray-700 pt-4 flex gap-2 sm:justify-between">
            <Button 
              variant="ghost" 
              onClick={(e) => handleDelete(e, selectedMessage.id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Apagar
            </Button>
            <Button 
              onClick={() => setSelectedMessage(null)} 
              className="bg-gray-700 hover:bg-gray-600 text-white"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}