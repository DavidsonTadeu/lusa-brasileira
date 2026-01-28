import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Trash2, Calendar, Megaphone, Info, Loader2 } from "lucide-react";
import { format, isAfter } from "date-fns";
import { pt } from "date-fns/locale";

export default function AdminAnnouncements() {
    const [formData, setFormData] = useState({
        title: "",
        message: "",
        type: "info", // info, promo, warning
        expires_at: ""
    });

    const queryClient = useQueryClient();

    // Busca anúncios
    const { data: announcements = [], isLoading } = useQuery({
        queryKey: ['admin-announcements'],
        queryFn: () => base44.entities.Announcement.list(),
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.Announcement.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
            setFormData({ title: "", message: "", type: "info", expires_at: "" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.Announcement.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-announcements'] }),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.expires_at) return;
        createMutation.mutate(formData);
    };

    // Filtra apenas os ativos para mostrar status
    const activeAnnouncements = announcements.filter(a => isAfter(new Date(a.expires_at), new Date()));

    const typeIcons = {
        info: <Info className="w-5 h-5 text-blue-400" />,
        promo: <Megaphone className="w-5 h-5 text-green-400" />,
        aviso: <Bell className="w-5 h-5 text-yellow-400" />
    };

    return (
        <div className="min-h-screen bg-gray-900 p-4 md:p-8 text-gray-100">
            <div className="max-w-7xl mx-auto"> {/* Aumentei um pouco a largura para respirar melhor */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-serif text-white mb-2">Central de Avisos</h1>
                    <p className="text-gray-400">Envie notificações gerais para todos os clientes.</p>
                </div>

                <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8"> {/* Ajuste de layout para telas grandes */}
                    
                    {/* --- FORMULÁRIO --- */}
                    <Card className="bg-gray-800 border-gray-700 p-6 h-fit shadow-xl sticky top-8">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-serif">
                            <Megaphone className="w-5 h-5 text-[var(--primary)]" /> Novo Aviso
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <Label className="text-gray-300">Título</Label>
                                <Input
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ex: Férias, Promoção de Natal..."
                                    className="bg-gray-900 border-gray-600 text-white mt-1 focus:border-[var(--primary)]"
                                />
                            </div>

                            <div>
                                <Label className="text-gray-300">Mensagem</Label>
                                <Textarea
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Escreva os detalhes..."
                                    rows={3}
                                    className="bg-gray-900 border-gray-600 text-white mt-1 focus:border-[var(--primary)]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-300">Tipo</Label>
                                    <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                                        <SelectTrigger className="bg-gray-900 border-gray-600 text-white mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                                            <SelectItem value="info" className="hover:bg-gray-700 cursor-pointer">Informação</SelectItem>
                                            <SelectItem value="promo" className="hover:bg-gray-700 cursor-pointer">Promoção</SelectItem>
                                            <SelectItem value="aviso" className="hover:bg-gray-700 cursor-pointer">Aviso Importante</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-gray-300">Visível até</Label>
                                    <Input
                                        type="date"
                                        value={formData.expires_at}
                                        onChange={e => setFormData({ ...formData, expires_at: e.target.value })}
                                        className="bg-gray-900 border-gray-600 text-white mt-1 [color-scheme:dark] cursor-pointer hover:border-gray-500 transition-colors"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">Expira automaticamente após esta data.</p>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full mt-2 font-bold text-white shadow-lg hover:opacity-90 transition-all h-12"
                                style={{ backgroundColor: 'var(--primary)' }}
                                disabled={!formData.title || !formData.expires_at || createMutation.isPending}
                            >
                                {createMutation.isPending ? (
                                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> A enviar...</>
                                ) : 'Publicar Aviso'}
                            </Button>
                        </form>
                    </Card>

                    {/* --- LISTA --- */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-700 pb-4">
                             <h2 className="text-xl font-bold text-white font-serif">Histórico de Avisos</h2>
                             <span className="bg-gray-800 border border-gray-700 px-3 py-1 rounded-full text-xs text-gray-400 font-medium">
                                {activeAnnouncements.length} ativos
                             </span>
                        </div>
                        
                        {isLoading && (
                            <div className="text-center py-10">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--primary)]"/>
                            </div>
                        )}

                        {announcements.length === 0 && !isLoading && (
                            <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-xl bg-gray-800/30">
                                <Megaphone className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                                <p className="text-gray-500 italic">Nenhum aviso criado.</p>
                            </div>
                        )}

                        <div className="grid gap-4">
                            {announcements.map((item) => {
                                const isActive = isAfter(new Date(item.expires_at), new Date());
                                return (
                                    <div
                                        key={item.id}
                                        className={`p-5 rounded-xl border transition-all hover:shadow-md ${isActive ? 'bg-gray-800 border-gray-700' : 'bg-gray-900 border-gray-800 opacity-60'}`}
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-1 p-2 rounded-full border ${isActive ? 'bg-gray-900 border-gray-600' : 'bg-transparent border-gray-800'}`}>
                                                    {typeIcons[item.type]}
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-bold text-lg">{item.title}</h3>
                                                    <p className="text-gray-400 text-sm mt-1 leading-relaxed">{item.message}</p>
                                                    
                                                    <div className="flex flex-wrap gap-3 mt-4 text-xs font-medium">
                                                        <span className={`px-2 py-1 rounded-md uppercase tracking-wider border flex items-center gap-1 ${isActive ? 'bg-green-900/20 text-green-400 border-green-900/50' : 'bg-red-900/20 text-red-400 border-red-900/50'}`}>
                                                            {isActive ? (
                                                                <><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/> Ativo</>
                                                            ) : 'Expirado'}
                                                        </span>
                                                        <span className="text-gray-500 flex items-center gap-1 bg-gray-900 px-2 py-1 rounded border border-gray-800">
                                                            <Calendar className="w-3 h-3" />
                                                            Até {format(new Date(item.expires_at), "dd/MM/yyyy", { locale: pt })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteMutation.mutate(item.id)}
                                                className="text-gray-500 hover:text-red-500 hover:bg-red-900/10 -mt-2 -mr-2"
                                                title="Apagar Aviso"
                                            >
                                                {deleteMutation.isPending && deleteMutation.variables === item.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}