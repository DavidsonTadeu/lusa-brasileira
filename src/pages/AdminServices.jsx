import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Briefcase, Star, Loader2, XCircle } from "lucide-react";

const categoryNames = {
  corte: "Cortes",
  coloracao: "Coloração",
  penteados: "Penteados",
  tratamentos: "Tratamentos",
  extensoes: "Extensões",
  noivas: "Noivas",
  outros: "Outros"
};

export default function AdminServices() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'corte',
    duration_minutes: 60,
    price: 0,
    price_from: false,
    is_active: true,
    is_featured: false,
    requires_consultation: false
  });

  const queryClient = useQueryClient();

  // Buscar serviços
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => base44.entities.Service.list('name'),
  });

  // Criar serviço
  const createServiceMutation = useMutation({
    mutationFn: (data) => base44.entities.Service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      resetForm();
      alert("Serviço criado com sucesso!");
    },
    onError: (error) => alert("Erro ao criar: " + error.message)
  });

  // Atualizar serviço
  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Service.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      if (isDialogOpen) resetForm();
    },
    onError: (error) => alert("Erro ao atualizar: " + error.message)
  });

  // Apagar serviço
  const deleteServiceMutation = useMutation({
    mutationFn: async (id) => await base44.entities.Service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      alert("Serviço apagado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao apagar:", error);
      if (error.message && error.message.includes("foreign key")) {
         alert("Não é possível apagar pois existem agendamentos ligados a este serviço. Por favor, desative-o (inativo) em vez de apagar.");
      } else {
         alert("Erro ao apagar: " + error.message);
      }
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'corte',
      duration_minutes: 60,
      price: 0,
      price_from: false,
      is_active: true,
      is_featured: false,
      requires_consultation: false
    });
    setEditingService(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData(service);
    setIsDialogOpen(true);
  };

  const toggleFeatured = (service) => {
    updateServiceMutation.mutate({
      id: service.id,
      data: { ...service, is_featured: !service.is_featured }
    });
  };

  const handleSubmit = () => {
    if (!formData.name) return alert("O nome é obrigatório.");
    
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data: formData });
    } else {
      createServiceMutation.mutate(formData);
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation(); // Impede abrir o modal de edição ao clicar no lixo
    if (window.confirm('Tem a certeza que deseja eliminar este serviço?')) {
      deleteServiceMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 text-gray-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif text-white mb-2">Catálogo de Serviços</h1>
            <p className="text-gray-400">Gerencie preços, durações e destaques do site.</p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-[var(--primary)] hover:opacity-90 text-white font-bold shadow-lg transition-transform hover:-translate-y-1"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Serviço
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin w-10 h-10 text-[var(--primary)]" />
            </div>
        )}

        {/* Grid de Serviços */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className={`bg-gray-800 border-gray-700 p-5 relative group hover:border-[var(--primary)]/50 transition-all ${!service.is_active ? 'opacity-60 border-dashed' : ''}`}>
                
                {/* Header do Card */}
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-700 text-gray-300 border border-gray-600">
                      {categoryNames[service.category] || service.category}
                    </span>
                    {service.is_featured && (
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 inline-flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400" /> Destaque
                      </span>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex gap-1">
                    <Button
                      size="icon" variant="ghost"
                      onClick={() => toggleFeatured(service)}
                      className={`h-8 w-8 hover:bg-gray-700 ${service.is_featured ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'}`}
                      title="Destacar na Home"
                    >
                      <Star className={`w-4 h-4 ${service.is_featured ? 'fill-yellow-400' : ''}`} />
                    </Button>
                    <Button
                      size="icon" variant="ghost"
                      onClick={() => handleEdit(service)}
                      className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon" variant="ghost"
                      onClick={(e) => handleDelete(e, service.id)}
                      className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-gray-700"
                      title="Apagar"
                    >
                      {deleteServiceMutation.isPending && deleteServiceMutation.variables === service.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                          <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Conteúdo */}
                <h3 className="text-lg font-bold text-white mb-1 truncate" title={service.name}>{service.name}</h3>
                <p className="text-xs text-gray-400 mb-4 line-clamp-2 h-8">{service.description || "Sem descrição."}</p>

                {/* Footer do Card (Info Técnica) */}
                <div className="bg-gray-900/50 rounded p-3 flex justify-between items-center text-sm border border-gray-700/50">
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-xs">Duração</span>
                    <span className="font-mono text-white">{service.duration_minutes} min</span>
                  </div>
                  <div className="h-8 w-px bg-gray-700"></div>
                  <div className="flex flex-col items-end">
                    <span className="text-gray-500 text-xs">Preço</span>
                    <span className="font-bold text-[var(--primary)]">
                      {service.price_from && <span className="text-xs font-normal text-gray-400 mr-1">desde</span>}
                      {service.price ? `€${Number(service.price).toFixed(2)}` : 'Sob Consulta'}
                    </span>
                  </div>
                </div>

                {/* Status Badge inferior */}
                {!service.is_active && (
                  <div className="absolute bottom-5 left-5">
                      <span className="text-[10px] text-red-400 flex items-center gap-1 font-bold uppercase tracking-wider">
                          <XCircle className="w-3 h-3" /> Inativo
                      </span>
                  </div>
                )}

            </Card>
          ))}
        </div>

        {services.length === 0 && !isLoading && (
          <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-xl bg-gray-800/20">
            <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-400 font-medium">Nenhum serviço encontrado</h3>
            <p className="text-gray-500 text-sm mt-2">Comece adicionando o seu primeiro serviço.</p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="mt-6 border-gray-600 text-gray-300 hover:text-white">
               Adicionar Serviço
            </Button>
          </div>
        )}
      </div>

      {/* --- DIALOG (MODAL) --- */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Nome e Categoria */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Nome do Serviço *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-gray-900 border-gray-600 focus:border-[var(--primary)] text-white"
                  placeholder="Ex: Alisamento Real"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-300">Categoria *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    {Object.entries(categoryNames).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="cursor-pointer focus:bg-gray-700 text-white hover:bg-gray-700">{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="bg-gray-900 border-gray-600 min-h-[80px] text-white"
                placeholder="Detalhes do procedimento..."
              />
            </div>

            {/* Duração e Preço */}
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-gray-300">Duração (minutos) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value) || 0})}
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-gray-300">Preço (€)</Label>
                <div className="relative">
                   <span className="absolute left-3 top-2.5 text-gray-500 font-bold">€</span>
                   <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    className="bg-gray-900 border-gray-600 pl-8 text-white"
                  />
                </div>
              </div>
            </div>
            
            {/* Toggles (Switches) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-700 hover:bg-gray-700/30 transition-colors">
                    <div className="space-y-0.5">
                        <Label className="text-base text-yellow-400 font-bold flex items-center gap-2 cursor-pointer">
                           <Star className="w-4 h-4 fill-yellow-400" /> Destaque Home
                        </Label>
                        <p className="text-xs text-gray-400">Aparece na página inicial</p>
                    </div>
                    <Switch
                        checked={formData.is_featured}
                        onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                        className="data-[state=checked]:bg-yellow-500"
                    />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-700 hover:bg-gray-700/30 transition-colors">
                    <div className="space-y-0.5">
                        <Label className="text-base text-white cursor-pointer">Ativo no Site</Label>
                        <p className="text-xs text-gray-400">Visível para clientes</p>
                    </div>
                    <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                        className="data-[state=checked]:bg-green-500"
                    />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-700 hover:bg-gray-700/30 transition-colors">
                    <div className="space-y-0.5">
                        <Label className="text-base text-white cursor-pointer">Preço "A partir de"</Label>
                        <p className="text-xs text-gray-400">Mostra "desde €X"</p>
                    </div>
                    <Switch
                        checked={formData.price_from}
                        onCheckedChange={(checked) => setFormData({...formData, price_from: checked})}
                        className="data-[state=checked]:bg-[var(--primary)]"
                    />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-700 hover:bg-gray-700/30 transition-colors">
                    <div className="space-y-0.5">
                        <Label className="text-base text-white cursor-pointer">Requer Consulta</Label>
                        <p className="text-xs text-gray-400">Avaliação prévia</p>
                    </div>
                    <Switch
                        checked={formData.requires_consultation}
                        onCheckedChange={(checked) => setFormData({...formData, requires_consultation: checked})}
                        className="data-[state=checked]:bg-blue-500"
                    />
                </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={resetForm} className="hover:bg-gray-700 text-gray-400 hover:text-white">Cancelar</Button>
            <Button onClick={handleSubmit} className="bg-[var(--primary)] hover:bg-red-700 text-white font-bold px-8">
                {createServiceMutation.isPending || updateServiceMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editingService ? 'Salvar Alterações' : 'Criar Serviço'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}