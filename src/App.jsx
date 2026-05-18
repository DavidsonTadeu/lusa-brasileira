import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute"; 

// Importe o Menu Flutuante
import FloatingMenu from "@/components/FloatingMenu";
// --- NOVO: Importe o ScrollToTop ---
import ScrollToTop from "@/components/ScrollToTop";

// Página Pública Principal (Mantida estática para carregamento rápido - FCP)
import Home from "./pages/Home";

// Páginas Secundárias (Lazy Loading)
const Services = lazy(() => import("./pages/Services"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Booking = lazy(() => import("./pages/Booking"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Páginas do Cliente (Lazy Loading)
const ClientAppointments = lazy(() => import("./pages/ClientAppointments"));
const Profile = lazy(() => import("./pages/Profile"));

// Páginas Administrativas (Lazy Loading)
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminAgenda = lazy(() => import("./pages/AdminAgenda"));
const AdminBookings = lazy(() => import("./pages/AdminBookings"));
const AdminClients = lazy(() => import("./pages/AdminClients"));
const AdminMessages = lazy(() => import("./pages/Adminmenssages"));
const AdminServices = lazy(() => import("./pages/AdminServices"));
const AdminGallery = lazy(() => import("./pages/AdminGallery"));
const AdminScheduleSettings = lazy(() => import("./pages/AdminScheduleSettings"));
const AdminAnnouncements = lazy(() => import("./pages/AdminAnnouncements"));

const LoadingFallback = () => (
  <div className="h-screen w-full flex items-center justify-center bg-white">
    <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
  </div>
);

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          {/* --- AQUI ESTÁ A CORREÇÃO --- */}
          {/* O ScrollToTop deve ficar aqui, dentro do Router mas antes de tudo */}
          <ScrollToTop />
          
          <div className="relative min-h-screen"> 
            
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* --- ROTAS PÚBLICAS --- */}
                <Route path="/" element={<Layout currentPageName="Home"><Home /></Layout>} />
                <Route path="/servicos" element={<Layout currentPageName="Services"><Services /></Layout>} />
                <Route path="/galeria" element={<Layout currentPageName="Gallery"><Gallery /></Layout>} />
                <Route path="/agendar" element={<Layout currentPageName="Booking"><Booking /></Layout>} />
                <Route path="/contacto" element={<Layout currentPageName="Contact"><Contact /></Layout>} />
                <Route path="/politica-privacidade" element={<Layout currentPageName="PrivacyPolicy"><PrivacyPolicy /></Layout>} />
                <Route path="/termos-uso" element={<Layout currentPageName="TermsOfUse"><TermsOfUse /></Layout>} />

                {/* --- ROTAS PROTEGIDAS (Cliente) --- */}
                <Route path="/meus-agendamentos" element={
                  <ProtectedRoute>
                    <Layout currentPageName="ClientAppointments">
                      <ClientAppointments />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/perfil" element={
                  <ProtectedRoute>
                    <Layout currentPageName="Profile">
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* --- ROTAS BLINDADAS (ADMIN) --- */}
                <Route path="/admin" element={
                  <ProtectedRoute roleRequired="admin">
                    <Layout currentPageName="AdminDashboard"><AdminDashboard /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/agenda" element={
                  <ProtectedRoute roleRequired="admin">
                    <Layout currentPageName="AdminAgenda"><AdminAgenda /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/agendamentos" element={
                  <ProtectedRoute roleRequired="admin">
                    <Layout currentPageName="AdminBookings"><AdminBookings /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/clientes" element={
                  <ProtectedRoute roleRequired="admin">
                    <Layout currentPageName="AdminClients"><AdminClients /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/mensagens" element={
                  <ProtectedRoute roleRequired="admin">
                    <Layout currentPageName="AdminMessages"><AdminMessages /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/servicos" element={
                  <ProtectedRoute roleRequired="admin">
                    <Layout currentPageName="AdminServices"><AdminServices /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/galeria" element={
                  <ProtectedRoute roleRequired="admin">
                    <Layout currentPageName="AdminGallery"><AdminGallery /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/horarios" element={
                  <ProtectedRoute roleRequired="admin">
                    <Layout currentPageName="AdminScheduleSettings"><AdminScheduleSettings /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/avisos" element={
                  <ProtectedRoute roleRequired="admin">
                    <Layout currentPageName="AdminAnnouncements"><AdminAnnouncements /></Layout>
                  </ProtectedRoute>
                } />

                {/* Rota 404 */}
                <Route path="*" element={<NotFound />} />

              </Routes>
            </Suspense>

            {/* Menu Flutuante Global */}
            <FloatingMenu />
            
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}