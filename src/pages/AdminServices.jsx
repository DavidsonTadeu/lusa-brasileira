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
import { Plus, Edit, Trash2, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

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

  const { data: services = [] } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => base44.entities.Service.list('name'),
  });

  const createServiceMutation = useMutation({
    mutationFn: (data) => base44.entities.Service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      resetForm();
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Service.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      resetForm();
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
    },
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

  const handleSubmit = () => {
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data: formData });
    } else {
      createServiceMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja eliminar este serviço?')) {
      deleteServiceMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Gestão de Serviços</h1>
            <p className="text-gray-400">Adicionar, editar e remover serviços</p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            style={{backgroundColor: 'var(--primary)'}}
            className="hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Serviço
          </Button>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="bg-gray-800 border-gray-700 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <span className="text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded" style={{backgroundColor: 'rgba(178, 34, 34, 0.2)', color: 'var(--primary)'}}>
                      {categoryNames[service.category]}
                    </span>
                    {service.is_featured && (
                      <span className="ml-2 text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded bg-yellow-900/30 text-yellow-400">
                        Destaque
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(service)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(service.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{service.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Duração:</span>
                    <span className="text-white font-medium">{service.duration_minutes} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Preço:</span>
                    <span className="text-white font-medium">
                      {service.price_from && 'desde '}
                      {service.price ? `€${service.price.toFixed(2)}` : 'Consultar'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 text-xs">
                  {service.is_active ? (
                    <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded">Ativo</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded">Inativo</span>
                  )}
                  {service.requires_consultation && (
                    <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded">Requer consulta</span>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {services.length === 0 && (
          <Card className="bg-gray-800 border-gray-700 p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhum serviço cadastrado</p>
          </Card>
        )}
      </div>

      {/* Service Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) resetForm();
      }}>
        <DialogContent className="bg-gray-600 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-gray-00">Nome do Serviço *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <Label htmlFor="category" className="text-gray-300">Categoria *</Label>
                {/* SELECT COM CORES CORRIGIDAS */}
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600 text-white">
                    {Object.entries(categoryNames).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="focus:bg-gray-600 focus:text-white hover:bg-gray-600 cursor-pointer text-white">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-300">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration" className="text-gray-300">Duração (minutos) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="price" className="text-gray-300">Preço (€)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            
            {/* Switches e botões permanecem iguais */}
            {/* ... */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm} className="bg-gray-700 border-gray-600 text-white hover:bg-gray-500">Cancelar</Button>
            <Button onClick={handleSubmit} style={{backgroundColor: 'var(--primary)'}}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}