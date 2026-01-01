import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute"; 

// Importe o Menu Flutuante
import FloatingMenu from "@/components/FloatingMenu";
// --- NOVO: Importe o ScrollToTop ---
import ScrollToTop from "@/components/ScrollToTop";

// Páginas Públicas
import Home from "./pages/Home";
import Services from "./pages/Services";
import Gallery from "./pages/Gallery";
import Booking from "./pages/Booking";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import NotFound from "./pages/NotFound";

// Páginas do Cliente
import ClientAppointments from "./pages/ClientAppointments";
import Profile from "./pages/Profile";

// Páginas Administrativas
import AdminDashboard from "./pages/AdminDashboard";
import AdminAgenda from "./pages/AdminAgenda";
import AdminBookings from "./pages/AdminBookings";
import AdminClients from "./pages/AdminClients";
import AdminMessages from "./pages/Adminmenssages";
import AdminServices from "./pages/AdminServices";
import AdminGallery from "./pages/AdminGallery";
import AdminScheduleSettings from "./pages/AdminScheduleSettings";
import AdminAnnouncements from "./pages/AdminAnnouncements";

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

            {/* Menu Flutuante Global */}
            <FloatingMenu />
            
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}