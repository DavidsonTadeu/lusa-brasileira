import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Check, X, ShieldCheck, Eye, EyeOff, ArrowLeft, Mail, Loader2 } from "lucide-react";import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client"; 
import { sendPasswordRecoveryEmail } from "@/api/emailService"; 

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, authView, setAuthView } = useAuth();
  
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    if (isAuthModalOpen) {
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      setError("");
      setSuccessMsg("");
      setPasswordStrength(0);
      setAcceptedTerms(false);
      setShowPassword(false);
    }
  }, [isAuthModalOpen]);

  const checkPasswordStrength = (pass) => {
    const criteria = {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[^A-Za-z0-9]/.test(pass)
    };
    setPasswordCriteria(criteria);
    const score = Object.values(criteria).filter(Boolean).length;
    setPasswordStrength(score);
  };

  const handlePasswordChange = (e) => {
    const newPass = e.target.value;
    setFormData({...formData, password: newPass});
    if (authView === 'register') {
      checkPasswordStrength(newPass);
    }
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const generateTempPassword = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000); 
    return `Lusa@${randomNum}`; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!validateEmail(formData.email)) {
      setError("Por favor, introduza um e-mail válido.");
      return;
    }

    try {
      setLoading(true);

      if (authView === 'login') {
        await login(formData.email, formData.password);
      
      } else if (authView === 'register') {
        if (formData.name.trim().length < 3) throw new Error("O nome deve ter pelo menos 3 letras.");
        if (passwordStrength < 3) throw new Error("A palavra-passe precisa de ser mais forte.");
        if (formData.password !== formData.confirmPassword) throw new Error("As palavras-passe não coincidem.");
        if (!acceptedTerms) throw new Error("É necessário aceitar a Política de Privacidade e os Termos de Utilização.");
        
        await register({ full_name: formData.name, email: formData.email, password: formData.password });
      
      } else if (authView === 'forgot') {
        const users = await base44.entities.User.filter({ email: formData.email });
        
        if (!users || users.length === 0) {
          throw new Error("Não encontrámos nenhuma conta com este e-mail.");
        }
        
        const targetUser = users[0];
        const tempPassword = generateTempPassword();

        await base44.entities.User.update(targetUser.id, { password: tempPassword });
        await sendPasswordRecoveryEmail(formData.email, tempPassword, targetUser.full_name);

        setSuccessMsg(`Sucesso! Enviámos uma palavra-passe temporária para o seu e-mail.`);
        setFormData({ ...formData, email: "" });
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao processar o seu pedido.");
    } finally {
      setLoading(false);
    }
  };

  if (authView === 'teaser') {
    return (
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 to-gray-800 text-white border-gray-700 shadow-2xl">
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-serif mb-2 text-white">
              Olá!
            </DialogTitle>
            <p className="text-gray-300 mb-6 px-4">
              Inicie sessão para ter acesso a promoções exclusivas e gerir os seus agendamentos na Lusa Brasileira.
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => setAuthView('login')} 
                className="w-full bg-[var(--primary)] hover:opacity-90 text-white font-semibold py-6"
              >
                Iniciar Sessão / Registar
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setIsAuthModalOpen(false)}
                className="text-gray-400 hover:text-white hover:bg-white/10"
              >
                Agora não, estou apenas a ver
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
      <DialogContent className="sm:max-w-md bg-white backdrop-blur-xl border-white/20 shadow-2xl overflow-y-auto max-h-[95vh]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-serif text-gray-900">
            {authView === 'login' && 'Bem-vinda de Volta'}
            {authView === 'register' && 'Criar Conta'}
            {authView === 'forgot' && 'Recuperar Palavra-passe'}
          </DialogTitle>
          <p className="text-center text-gray-500 text-sm">
            {authView === 'login' && 'Aceda à sua conta para gerir agendamentos'}
            {authView === 'register' && 'Preencha os dados abaixo'}
            {authView === 'forgot' && 'Introduza o seu e-mail para receber uma palavra-passe temporária'}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          
          {successMsg && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm text-center border border-green-200">
              {successMsg}
            </div>
          )}

          {authView === 'register' && (
            <div>
              <Label className="text-gray-700">Nome Completo</Label>
              <Input 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required 
                className="bg-gray-50 border-gray-200 focus:border-[var(--primary)]"
                placeholder="Ex: Maria Silva"
              />
            </div>
          )}
          
          <div>
            <Label className="text-gray-700">E-mail</Label>
            <div className="relative">
              <Input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required 
                className="bg-gray-50 border-gray-200 pl-9 focus:border-[var(--primary)]" 
                placeholder="exemplo@email.com"
              />
               <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {(authView === 'login' || authView === 'register') && (
            <div>
              <Label className="mb-1 block text-gray-700">Palavra-passe</Label>
              
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={formData.password}
                  onChange={handlePasswordChange}
                  required 
                  className="bg-gray-50 border-gray-200 pr-10 focus:border-[var(--primary)]" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authView === 'login' && (
                <div className="flex justify-end mt-1">
                  <button 
                    type="button"
                    onClick={() => { setAuthView('forgot'); setError(""); setSuccessMsg(""); }}
                    className="text-xs text-gray-500 hover:text-[var(--primary)] hover:underline"
                  >
                    Esqueceu-se da palavra-passe?
                  </button>
                </div>
              )}
              
              {authView === 'register' && formData.password.length > 0 && (
                <div className="mt-3 space-y-2 p-3 bg-gray-50 rounded-md border border-gray-100">
                  <div className="flex gap-1 h-1.5 mb-2">
                    {[1, 2, 3, 4].map((level) => (
                      <div 
                        key={level} 
                        className={`flex-1 rounded-full transition-colors duration-300 ${
                          passwordStrength >= level 
                            ? (passwordStrength < 2 ? 'bg-red-500' : passwordStrength < 4 ? 'bg-yellow-500' : 'bg-green-500') 
                            : 'bg-gray-200'
                        }`} 
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <p className={`text-[10px] flex items-center gap-1 ${passwordCriteria.length ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordCriteria.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} 8+ Caracteres
                    </p>
                    <p className={`text-[10px] flex items-center gap-1 ${passwordCriteria.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordCriteria.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Maiúscula
                    </p>
                    <p className={`text-[10px] flex items-center gap-1 ${passwordCriteria.number ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordCriteria.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Número
                    </p>
                    <p className={`text-[10px] flex items-center gap-1 ${passwordCriteria.special ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordCriteria.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Símbolo
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {authView === 'register' && (
            <>
              <div>
                <Label className="text-gray-700">Confirmar Palavra-passe</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    required 
                    className="bg-gray-50 border-gray-200 pr-10 focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <label htmlFor="terms" className="text-xs text-gray-600 leading-tight cursor-pointer">
                  Li e aceito a{" "}
                  <Link to={createPageUrl("PrivacyPolicy")} target="_blank" className="text-[var(--primary)] hover:underline">Política de Privacidade</Link>
                  {" "}e os{" "}
                  <Link to={createPageUrl("TermsOfUse")} target="_blank" className="text-[var(--primary)] hover:underline">Termos de Utilização</Link>.
                </label>
              </div>
            </>
          )}

          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded border border-red-100">{error}</p>}

          <Button 
            type="submit" 
            className="w-full bg-[var(--primary)] hover:opacity-90 mt-2 h-12 text-white font-bold" 
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
              authView === 'login' ? 'Entrar na Conta' : 
              authView === 'register' ? 'Criar a minha Conta' : 
              'Enviar Palavra-passe Temporária'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm border-t border-gray-100 pt-4">
          {authView === 'login' && (
            <p className="text-gray-600">
              Ainda não tem conta?{" "}
              <button onClick={() => { setAuthView('register'); setError(""); }} className="text-[var(--primary)] font-bold hover:underline">
                Registar agora
              </button>
            </p>
          )}
          {authView === 'register' && (
            <p className="text-gray-600">
              Já tem conta?{" "}
              <button onClick={() => { setAuthView('login'); setError(""); }} className="text-[var(--primary)] font-bold hover:underline">
                Iniciar Sessão
              </button>
            </p>
          )}
          {authView === 'forgot' && (
             <button onClick={() => { setAuthView('login'); setError(""); setSuccessMsg(""); }} className="text-gray-600 hover:text-black flex items-center justify-center gap-2 mx-auto">
                <ArrowLeft className="w-3 h-3" /> Voltar ao Login
             </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}