
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { DataProvider } from "./context/DataContext";
import { AuthProvider } from "./context/AuthContext";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import { PublicOnlyRoute } from "./components/auth/PublicOnlyRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Pets from "./pages/Pets";
import Funcionarios from "./pages/Funcionarios";
import Servicos from "./pages/Servicos";
import Produtos from "./pages/Produtos";
import Atendimentos from "./pages/Atendimentos";
import Login from "./pages/Login";
import Agendamento from "./pages/Agendamento";
import AgendamentoOnline from "./pages/AgendamentoOnline";
import HorariosDisponiveis from "./pages/admin/HorariosDisponiveis";
import AdminAgendamentos from "./pages/admin/Agendamentos";
import EmailLembretes from "./pages/admin/EmailLembretes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/login" element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              } />
              <Route path="/agendamento-online" element={<AgendamentoOnline />} />

              {/* Rotas dentro do layout principal */}
              <Route path="/" element={<MainLayout><Outlet /></MainLayout>}>
                <Route index element={<Dashboard />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/pets" element={<Pets />} />
                <Route path="/agendamento" element={<Agendamento />} />
                
                {/* Rotas protegidas (apenas para funcionários logados) */}
                <Route path="/funcionarios" element={
                  <PrivateRoute>
                    <Funcionarios />
                  </PrivateRoute>
                } />
                <Route path="/servicos" element={
                  <PrivateRoute>
                    <Servicos />
                  </PrivateRoute>
                } />
                <Route path="/produtos" element={
                  <PrivateRoute>
                    <Produtos />
                  </PrivateRoute>
                } />
                <Route path="/atendimentos" element={
                  <PrivateRoute>
                    <Atendimentos />
                  </PrivateRoute>
                } />
                
                {/* Rotas administrativas */}
                <Route path="/admin">
                  <Route path="horarios" element={
                    <PrivateRoute adminOnly>
                      <HorariosDisponiveis />
                    </PrivateRoute>
                  } />
                  <Route path="agendamentos" element={
                    <PrivateRoute adminOnly>
                      <AdminAgendamentos />
                    </PrivateRoute>
                  } />
                  <Route path="lembretes-email" element={
                    <PrivateRoute adminOnly>
                      <EmailLembretes />
                    </PrivateRoute>
                  } />
                </Route>
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
