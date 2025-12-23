import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Upload, Loader2, Image as ImageIcon, Save } from "lucide-react";

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
  // Título agora começa vazio e não é obrigatório
  const [formData, setFormData] = useState({ title: "", category: "corte" });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['admin-gallery'],
    queryFn: () => base44.entities.GalleryImage.list('-created_at'),
  });

  const deleteImageMutation = useMutation({
    mutationFn: (id) => base44.entities.GalleryImage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });

  // --- SOLUÇÃO MÁGICA: Converter Imagem para Texto (Base64) ---
  // Isso garante que a imagem salva no banco e nunca mais some
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Limite de 4MB para não pesar o banco de dados
      if (file.size > 4 * 1024 * 1024) { 
        alert("A imagem é muito grande. Tente uma menor que 4MB.");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Agora só exigimos o arquivo, não o título
    if (!selectedFile) {
      alert("Por favor, selecione uma imagem.");
      return;
    }

    setIsUploading(true);
    try {
      console.log("Convertendo imagem...");
      const base64Image = await convertToBase64(selectedFile);

      console.log("Salvando no banco...");
      // Enviamos a string base64 diretamente como image_url
      await base44.entities.GalleryImage.create({
        title: formData.title || "", // Se não tiver título, envia string vazia
        category: formData.category,
        image_url: base64Image, 
        created_at: new Date().toISOString()
      });

      // Limpeza
      setFormData({ title: "", category: "corte" });
      setSelectedFile(null);
      setPreviewUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      alert("Imagem publicada com sucesso!");

    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar a imagem. Pode ser que ela seja muito pesada.");
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
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULÁRIO */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-800 border-gray-700 sticky top-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-[var(--primary)]" /> Adicionar Nova Foto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="space-y-2">
                  <Label className="text-gray-300">Imagem</Label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${previewUrl ? 'border-[var(--primary)] bg-gray-900' : 'border-gray-600 hover:border-gray-500 bg-gray-900'}`}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-md object-contain" />
                    ) : (
                      <div className="py-8 text-gray-500 flex flex-col items-center">
                        <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                        <p>Clique para selecionar</p>
                        <p className="text-xs text-gray-600 mt-1">Máx 4MB</p>
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

                <div className="space-y-2">
                  <Label className="text-gray-300">Título / Cliente (Opcional)</Label>
                  <Input 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="Ex: Madeixas (Deixe vazio se preferir)"
                    className="bg-gray-900 border-gray-700 text-white"
                    // REMOVI O REQUIRED
                  />
                </div>

                <div className="space-y-2">
                   <Label className="text-gray-300">Categoria</Label>
                   <select
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full p-2 rounded-md bg-gray-900 border border-gray-700 text-white focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                    >
                      {Object.entries(categoryNames).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[var(--primary)] hover:opacity-90 text-white font-semibold"
                  disabled={isUploading || !selectedFile}
                >
                  {isUploading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A publicar...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Publicar Foto</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* LISTA */}
        <div className="lg:col-span-2">
           <div className="mb-6">
            <h2 className="text-2xl font-bold text-white" style={{fontFamily: "'Playfair Display', serif"}}>
              Fotos Publicadas
            </h2>
            <p className="text-gray-400">Gerencie as imagens que aparecem no site.</p>
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-gray-400"><Loader2 className="w-8 h-8 animate-spin mx-auto" /> Carregando...</div>
          ) : images.length === 0 ? (
             <div className="text-center py-20 bg-gray-800 rounded-lg border border-dashed border-gray-700 text-gray-500">
                Nenhuma imagem na galeria ainda.
             </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img) => (
                <div key={img.id} className="relative group bg-gray-800 rounded-lg overflow-hidden shadow-md border border-gray-700">
                  <div className="aspect-square overflow-hidden">
                     <img 
                       src={img.image_url} 
                       alt={img.title || "Sem título"}
                       // CORREÇÃO DO CORTE: object-top
                       className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                     />
                  </div>
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                     <div className="flex justify-end">
                        <button 
                          onClick={() => handleDelete(img.id)}
                          className="bg-red-600/80 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                          title="Apagar"
                        >
                          {deleteImageMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                     </div>
                     <div>
                        {/* Só mostra título se existir */}
                        {img.title && <p className="text-white font-bold truncate">{img.title}</p>}
                        <span className="text-xs text-[var(--primary)] bg-black/50 px-2 py-1 rounded-full">
                          {categoryNames[img.category]}
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