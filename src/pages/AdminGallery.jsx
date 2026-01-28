import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Upload, Loader2, Image as ImageIcon, Save, X } from "lucide-react";

const categoryNames = {
  corte: "Cortes",
  coloracao: "Coloração",
  penteados: "Penteados",
  tratamentos: "Tratamentos",
  extensoes: "Extensões",
  noivas: "Noivas"
};

export default function AdminGallery() {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [formData, setFormData] = useState({ title: "", category: "corte" });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['admin-gallery'],
    queryFn: () => base44.entities.GalleryImage.list(),
  });

  const deleteImageMutation = useMutation({
    mutationFn: (id) => base44.entities.GalleryImage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
    onError: (err) => alert("Erro ao apagar: " + err.message)
  });

  // --- COMPRESSÃO DE IMAGEM ---
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        // Qualidade 0.8 para bom equilíbrio
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(base64);
      };

      img.onerror = (error) => reject(error);
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) { 
        alert("A imagem é excessivamente grande. Tente uma menor que 20MB.");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert("Por favor, selecione uma imagem.");
      return;
    }

    setIsUploading(true);
    try {
      const compressedBase64 = await compressImage(selectedFile);
      
      await base44.entities.GalleryImage.create({
        title: formData.title || "",
        category: formData.category,
        url: compressedBase64,
        is_active: true
      });

      // Limpeza
      setFormData({ title: "", category: "corte" });
      setSelectedFile(null);
      setPreviewUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      // alert("Imagem publicada com sucesso!"); // Opcional, feedback visual já basta

    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert(`Erro ao salvar: ${error.message || "Tente novamente."}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem a certeza que deseja apagar esta imagem?")) {
      deleteImageMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 text-gray-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- COLUNA 1: EDITOR --- */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-800 border-gray-700 sticky top-8 shadow-xl">
            <CardHeader className="border-b border-gray-700 pb-4">
              <CardTitle className="text-white flex items-center gap-2 font-serif">
                <Upload className="w-5 h-5 text-[var(--primary)]" /> Nova Publicação
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Upload Area */}
                <div className="space-y-2">
                  <Label className="text-gray-300 font-medium">Foto do Trabalho</Label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      relative group border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all h-64 flex flex-col items-center justify-center
                      ${previewUrl ? 'border-[var(--primary)] bg-gray-900' : 'border-gray-600 hover:border-gray-500 bg-gray-900/50 hover:bg-gray-800'}
                    `}
                  >
                    {previewUrl ? (
                      <>
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <p className="text-white font-medium flex items-center gap-2">
                             <ImageIcon className="w-5 h-5" /> Trocar Imagem
                           </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-500 flex flex-col items-center gap-3">
                        <div className="p-4 rounded-full bg-gray-800 group-hover:bg-gray-700 transition-colors">
                           <Upload className="w-8 h-8 opacity-70" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-gray-400">Clique para carregar</p>
                          <p className="text-xs text-gray-600 mt-1">JPG, PNG (Max 10MB)</p>
                        </div>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Campos de Texto */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Título (Opcional)</Label>
                    <Input 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      placeholder="Ex: Alisamento em Cabelo Crespo"
                      className="bg-gray-900 border-gray-700 text-white focus:border-[var(--primary)]"
                    />
                  </div>

                  <div className="space-y-2">
                      <Label className="text-gray-300">Categoria</Label>
                      <select
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full p-2.5 rounded-md bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-[var(--primary)] focus:outline-none cursor-pointer"
                      >
                        {Object.entries(categoryNames).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[var(--primary)] hover:bg-red-700 text-white font-bold h-12 text-lg shadow-lg mt-4"
                  disabled={isUploading || !selectedFile}
                >
                  {isUploading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Publicando...</>
                  ) : (
                    <><Save className="w-5 h-5 mr-2" /> Publicar na Galeria</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* --- COLUNA 2: LISTA DE FOTOS --- */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-4">
            <div>
              <h2 className="text-3xl font-bold text-white font-serif">Galeria do Salão</h2>
              <p className="text-gray-400">Total de {images.length} fotos publicadas</p>
            </div>
           </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" /></div>
          ) : images.length === 0 ? (
             <div className="text-center py-20 bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-700">
               <ImageIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
               <p className="text-gray-500 font-medium text-lg">A galeria está vazia.</p>
               <p className="text-gray-600">Use o formulário ao lado para adicionar o primeiro trabalho.</p>
             </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img) => (
                <div key={img.id} className="group relative aspect-[4/5] bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-[var(--primary)]/50 transition-all">
                  
                  {/* Imagem */}
                  <img 
                    src={img.url} 
                    alt={img.title || "Trabalho realizado"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Overlay com Informações */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      
                      {/* Botão Apagar (Canto Superior) */}
                      <div className="absolute top-2 right-2 translate-y-[-10px] group-hover:translate-y-0 transition-transform duration-300">
                         <Button
                           size="icon"
                           variant="destructive"
                           onClick={() => handleDelete(img.id)}
                           className="h-8 w-8 rounded-full shadow-md bg-red-600 hover:bg-red-700"
                           title="Apagar foto"
                         >
                            {deleteImageMutation.isPending && deleteImageMutation.variables === img.id ? 
                              <Loader2 className="w-4 h-4 animate-spin" /> : 
                              <Trash2 className="w-4 h-4" />
                            }
                         </Button>
                      </div>

                      {/* Textos */}
                      <div className="translate-y-[10px] group-hover:translate-y-0 transition-transform duration-300">
                        {img.title && <p className="text-white font-bold text-sm truncate mb-1">{img.title}</p>}
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[var(--primary)] text-white shadow-sm">
                          {categoryNames[img.category] || img.category}
                        </span>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}