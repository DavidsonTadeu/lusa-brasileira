import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Mail, Lock, Save, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  
  // Controle de visibilidade das senhas
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: user.full_name || "",
        phone: user.phone || ""
      }));
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        full_name: data.full_name,
        phone: data.phone
      };
      // Só envia senha se houver nova
      if (data.newPassword) {
        payload.password = data.newPassword;
      }
      return await base44.entities.User.update(user.id, payload);
    },
    onSuccess: () => {
      setMsg({ type: "success", text: "Perfil e segurança atualizados com sucesso!" });
      setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      setTimeout(() => window.location.reload(), 1500);
    },
    onError: () => {
      setMsg({ type: "error", text: "Erro ao atualizar. Tente novamente." });
    }
  });

  // Validação de Senha Forte
  const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) return "A senha deve ter pelo menos 8 caracteres.";
    if (!hasUpperCase) return "A senha deve ter pelo menos uma letra maiúscula.";
    if (!hasNumber) return "A senha deve ter pelo menos um número.";
    if (!hasSpecialChar) return "A senha deve ter pelo menos um caractere especial.";
    
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    // Se o usuário está tentando mudar a senha
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setMsg({ type: "error", text: "A confirmação da senha não coincide." });
        return;
      }

      const strengthError = validatePasswordStrength(formData.newPassword);
      if (strengthError) {
        setMsg({ type: "error", text: strengthError });
        return;
      }

      if (formData.newPassword === formData.currentPassword) {
        setMsg({ type: "error", text: "A nova senha não pode ser igual à anterior." });
        return;
      }
    }

    updateProfileMutation.mutate(formData);
  };

  if (!user) return <div className="p-8 text-center">A carregar...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900" style={{fontFamily: "'Playfair Display', serif"}}>
            O Meu Perfil
          </h1>
          <p className="text-gray-500">Mantenha os seus dados seguros.</p>
        </div>

        <Card className="shadow-lg border-t-4 border-t-[var(--primary)]">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="text-lg text-gray-700 flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--primary)]" /> Dados da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {msg.text && (
                <div className={`p-4 rounded-md flex items-start gap-2 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {msg.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                  <span>{msg.text}</span>
                </div>
              )}

              {/* Dados Pessoais */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input 
                      value={formData.full_name} 
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Telemóvel</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-500">Email (Fixo)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input 
                    value={user.email} 
                    disabled 
                    className="pl-10 bg-gray-100 text-gray-500 cursor-not-allowed" 
                  />
                </div>
              </div>

              {/* Área de Segurança */}
              <div className="border border-gray-200 rounded-lg p-5 bg-gray-50 mt-6">
                <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[var(--primary)]" /> Alterar Senha
                </h3>
                
                <div className="space-y-4">
                  {/* Senha Atual */}
                  <div className="space-y-2">
                     <Label className="text-xs text-gray-500 uppercase font-bold">Senha Atual</Label>
                     <div className="relative">
                        <Input 
                          type={showCurrentPass ? "text" : "password"}
                          value={formData.currentPassword}
                          onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                          placeholder="Digite a sua senha atual"
                          className="bg-white pr-10"
                        />
                         <button 
                           type="button" 
                           onClick={() => setShowCurrentPass(!showCurrentPass)} 
                           className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                         >
                          {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                     </div>
                  </div>

                  <hr className="border-gray-200" />

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Nova Senha */}
                    <div className="space-y-2">
                      <Label>Nova Senha</Label>
                      <div className="relative">
                        <Input 
                          type={showNewPass ? "text" : "password"}
                          value={formData.newPassword}
                          onChange={e => setFormData({...formData, newPassword: e.target.value})}
                          placeholder="Mín 8 carateres"
                          className="bg-white pr-10"
                        />
                        <button 
                           type="button" 
                           onClick={() => setShowNewPass(!showNewPass)} 
                           className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                         >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    {/* Confirmar Senha */}
                    <div className="space-y-2">
                      <Label>Confirmar Nova Senha</Label>
                      <div className="relative">
                        <Input 
                          type={showConfirmPass ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                          placeholder="Repita a senha"
                          className="bg-white pr-10"
                        />
                        <button 
                           type="button" 
                           onClick={() => setShowConfirmPass(!showConfirmPass)} 
                           className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                         >
                          {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    * A senha deve conter: 8+ caracteres, 1 Maiúscula, 1 Número e 1 Símbolo.
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full md:w-auto"
                style={{backgroundColor: 'var(--primary)'}}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Atualizando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Salvar Alterações
                  </>
                )}
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}