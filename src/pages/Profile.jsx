import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Mail, Lock, Save, Loader2, CheckCircle, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Profile() {
  const { user } = useAuth();
  
  // Controlo de visibilidade das palavras-passe
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

      if (data.newPassword) {
        try {
          await base44.auth.login(user.email, data.currentPassword);
        } catch (error) {
          throw new Error("WRONG_CURRENT_PASSWORD");
        }
        payload.password = data.newPassword;
      }

      return await base44.entities.User.update(user.id, payload);
    },
    onSuccess: () => {
      setMsg({ type: "success", text: "Perfil atualizado com sucesso!" });
      setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      setTimeout(() => setMsg({ type: "", text: "" }), 3000);
    },
    onError: (error) => {
      if (error.message === "WRONG_CURRENT_PASSWORD") {
        setMsg({ type: "error", text: "A palavra-passe atual está incorreta. Não foi possível guardar." });
      } else {
        setMsg({ type: "error", text: "Erro ao atualizar. Verifique a sua ligação." });
      }
    }
  });

  const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) return "A palavra-passe deve ter pelo menos 8 caracteres.";
    if (!hasUpperCase) return "A palavra-passe deve ter pelo menos uma letra maiúscula.";
    if (!hasNumber) return "A palavra-passe deve ter pelo menos um número.";
    if (!hasSpecialChar) return "A palavra-passe deve ter pelo menos um caráter especial.";
    
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setMsg({ type: "error", text: "Por favor, introduza a sua palavra-passe atual para confirmar." });
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setMsg({ type: "error", text: "A confirmação da palavra-passe não coincide." });
        return;
      }

      const strengthError = validatePasswordStrength(formData.newPassword);
      if (strengthError) {
        setMsg({ type: "error", text: strengthError });
        return;
      }

      if (formData.newPassword === formData.currentPassword) {
        setMsg({ type: "error", text: "A nova palavra-passe não pode ser igual à anterior." });
        return;
      }
    }

    updateProfileMutation.mutate(formData);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  if (!user) return <div className="p-8 text-center flex justify-center"><Loader2 className="animate-spin text-[var(--primary)]" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        
        <div className="mb-10 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[var(--primary)] to-red-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border-4 border-white text-white text-3xl font-bold">
            {getInitials(user.full_name)}
          </div>
          <h1 className="text-3xl font-bold text-gray-900" style={{fontFamily: "'Playfair Display', serif"}}>
            Olá, {user.full_name?.split(" ")[0]}
          </h1>
          <p className="text-gray-500">Gira as suas informações pessoais</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <AnimatePresence>
            {msg.text && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-xl flex items-start gap-3 text-sm font-medium shadow-sm overflow-hidden
                ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
              >
                {msg.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                <span>{msg.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <Card className="shadow-md border-none overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                <User className="w-5 h-5 text-[var(--primary)]" /> Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input 
                      value={formData.full_name} 
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                      className="pl-10 h-11"
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
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-500">E-mail (Não editável)</Label>
                <div className="relative opacity-70">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input 
                    value={user.email} 
                    disabled 
                    className="pl-10 bg-gray-50 border-dashed border-gray-300 cursor-not-allowed h-11" 
                  />
                  <Lock className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-none overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[var(--primary)]" /> Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                      Palavra-passe Atual {formData.newPassword && <span className="text-red-500">* Obrigatória</span>}
                    </Label>
                    <div className="relative">
                      <Input 
                        type={showCurrentPass ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                        placeholder="Introduza a sua palavra-passe atual"
                        className={`bg-white pr-10 h-11 ${!formData.currentPassword && formData.newPassword ? 'border-red-300 ring-1 ring-red-100' : ''}`}
                      />
                        <button 
                          type="button" 
                          onClick={() => setShowCurrentPass(!showCurrentPass)} 
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showCurrentPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                  {formData.currentPassword.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-4 border-t border-gray-100"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Nova Palavra-passe</Label>
                          <div className="relative">
                            <Input 
                              type={showNewPass ? "text" : "password"}
                              value={formData.newPassword}
                              onChange={e => setFormData({...formData, newPassword: e.target.value})}
                              placeholder="Mín. 8 caracteres"
                              className="bg-white pr-10 h-11"
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowNewPass(!showNewPass)} 
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                              >
                                {showNewPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Confirmar Nova Palavra-passe</Label>
                          <div className="relative">
                            <Input 
                              type={showConfirmPass ? "text" : "password"}
                              value={formData.confirmPassword}
                              onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                              placeholder="Repita a palavra-passe"
                              className="bg-white pr-10 h-11"
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowConfirmPass(!showConfirmPass)} 
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                              >
                                {showConfirmPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        * A nova palavra-passe deve conter: 8+ caracteres, 1 Maiúscula, 1 Número e 1 Caráter especial.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4 pb-12">
            <Button 
              type="submit" 
              className="w-full md:w-auto h-12 px-8 text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              style={{backgroundColor: 'var(--primary)'}}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> A Guardar...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" /> Guardar Alterações
                </>
              )}
            </Button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}