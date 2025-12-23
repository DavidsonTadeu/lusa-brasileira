import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Quote, Send, Sparkles, Lock } from "lucide-react"; // Importei o ícone Lock
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function TestimonialsSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", rating: 5, text: "" });
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: reviews = [] } = useQuery({
    queryKey: ['public-reviews'],
    queryFn: async () => {
      const all = await base44.entities.Review.list();
      return all.filter(r => r.approved !== false);
    }
  });

  const createReviewMutation = useMutation({
    mutationFn: (newReview) => base44.entities.Review.create(newReview),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-reviews'] });
      setIsDialogOpen(false);
      setFormData({ name: "", rating: 5, text: "" });
    },
  });

  // Preenche o nome automaticamente e TRAVA se houver utilizador
  useEffect(() => {
    if (isDialogOpen) {
      if (user?.full_name) {
        setFormData(prev => ({ ...prev, name: user.full_name }));
      } else {
        // Se não estiver logado, limpa ou mantém vazio
        setFormData(prev => ({ ...prev, name: "" }));
      }
    }
  }, [isDialogOpen, user]);

  const handleSubmit = () => {
    if (!formData.name || !formData.text) return;
    createReviewMutation.mutate({
      ...formData,
      date: new Date().toISOString(),
      approved: true 
    });
  };

  return (
    <section className="py-20 mt-16 bg-gray-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--primary)] opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--primary)] opacity-5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{fontFamily: "'Playfair Display', serif"}}>
              O Carinho das Nossas Clientes
            </h2>
            <div className="h-1 w-20 bg-[var(--primary)] mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A satisfação de quem confia no meu trabalho é a minha maior motivação.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {reviews.slice(0, 3).map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-8 h-full bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all relative">
                <Quote className="absolute top-6 right-6 w-8 h-8 text-gray-100 fill-current" />
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic leading-relaxed">"{review.text}"</p>
                
                <div className="mt-auto flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {review.name ? review.name[0].toUpperCase() : "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{review.name}</p>
                    <p className="text-xs text-gray-400">Cliente Verificada</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button 
            onClick={() => setIsDialogOpen(true)}
            size="lg"
            className="shadow-lg hover:scale-105 transition-transform text-white"
            style={{backgroundColor: 'var(--primary)'}}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Deixar o meu Depoimento
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle style={{fontFamily: "'Playfair Display', serif"}} className="text-2xl">Partilhe a sua Experiência</DialogTitle>
            <DialogDescription>
              A sua opinião é muito importante para mim.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label className="text-gray-700">O seu nome</Label>
                {/* Se estiver logado, mostra um cadeado pequeno indicando que é fixo */}
                {user && <Lock className="w-3 h-3 text-gray-400" />}
              </div>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Maria Santos"
                // AQUI ESTÁ A MÁGICA: Desabilita se tiver user logado
                disabled={!!user}
                className={`border-gray-200 mt-1 ${user ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-gray-50'}`}
              />
            </div>

            <div>
              <Label className="text-gray-700 mb-2 block">Quantas estrelas?</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({...formData, rating: star})}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-8 h-8 ${star <= formData.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-700">O seu comentário</Label>
              <Textarea 
                value={formData.text} 
                onChange={e => setFormData({...formData, text: e.target.value})}
                placeholder="Conte-nos o que mais gostou..."
                rows={4}
                className="bg-gray-50 border-gray-200 mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} className="text-white" style={{backgroundColor: 'var(--primary)'}}>
              <Send className="w-4 h-4 mr-2" />
              Enviar Avaliação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}