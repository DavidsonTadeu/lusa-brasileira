import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Trash2, Calendar, Megaphone, Info } from "lucide-react";
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
    const { data: announcements = [] } = useQuery({
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

    const typeLabels = {
        info: "Informação",
        promo: "Promoção",
        aviso: "Aviso Importante"
    };

    return (
        <div className="min-h-screen bg-gray-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Central de Avisos</h1>
                    <p className="text-gray-400">Envie notificações gerais para todos os clientes</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Form */}
                    <Card className="bg-gray-800 border-gray-700 p-6 h-fit">
                        <h2 className="text-xl font-semibold text-white mb-4">Novo Aviso</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label className="text-gray-300">Título</Label>
                                <Input
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ex: Férias, Promoção de Natal..."
                                    className="bg-gray-700 border-gray-600 text-white mt-1"
                                />
                            </div>

                            <div>
                                <Label className="text-gray-300">Mensagem</Label>
                                <Textarea
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="Escreva os detalhes..."
                                    rows={3}
                                    className="bg-gray-700 border-gray-600 text-white mt-1"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-300">Tipo</Label>
                                    {/* ADICIONEI text-gray-900 PARA O TEXTO DENTRO DO SELETOR FICAR VISÍVEL */}
                                    <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        {/* ADICIONEI bg-gray-700 text-white NO SELECTCONTENT */}
                                        <SelectContent className="bg-gray-700 text-white border-gray-600"> {/* ESSAS CLASSES AGORA VÃO FUNCIONAR */}
                                            <SelectItem value="info">Informação</SelectItem>
                                            <SelectItem value="promo">Promoção</SelectItem>
                                            <SelectItem value="aviso">Aviso Importante</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-gray-300">Visível até</Label>
                                    <Input
                                        type="date"
                                        value={formData.expires_at}
                                        onChange={e => setFormData({ ...formData, expires_at: e.target.value })}
                                        className="bg-gray-700 border-gray-600 text-white mt-1"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">Sairá do ar automaticamente após esta data.</p>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full mt-2"
                                style={{ backgroundColor: 'var(--primary)' }}
                                disabled={!formData.title || !formData.expires_at || createMutation.isPending}
                            >
                                {createMutation.isPending ? 'A enviar...' : 'Publicar Aviso'}
                            </Button>
                        </form>
                    </Card>

                    {/* List */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">Avisos Ativos ({activeAnnouncements.length})</h2>
                        {announcements.length === 0 && (
                            <p className="text-gray-500 italic">Nenhum aviso criado.</p>
                        )}

                        {announcements.map((item) => {
                            const isActive = isAfter(new Date(item.expires_at), new Date());
                            return (
                                <div
                                    key={item.id}
                                    className={`p-4 rounded-lg border ${isActive ? 'bg-gray-800 border-gray-600' : 'bg-gray-900 border-gray-800 opacity-60'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">{typeIcons[item.type]}</div>
                                            <div>
                                                <h3 className="text-white font-medium">{item.title}</h3>
                                                <p className="text-gray-400 text-sm mt-1">{item.message}</p>
                                                <div className="flex gap-4 mt-2 text-xs">
                                                    <span className={`px-2 py-0.5 rounded ${isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                                        {isActive ? 'Ativo' : 'Expirado'}
                                                    </span>
                                                    <span className="text-gray-500 flex items-center gap-1">
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
                                            className="text-gray-500 hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}