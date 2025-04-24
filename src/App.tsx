
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { DataProvider } from "./context/DataContext";

// Pages
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Pets from "./pages/Pets";
import Funcionarios from "./pages/Funcionarios";
import Servicos from "./pages/Servicos";
import Produtos from "./pages/Produtos";
import Atendimentos from "./pages/Atendimentos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DataProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/pets" element={<Pets />} />
              <Route path="/funcionarios" element={<Funcionarios />} />
              <Route path="/servicos" element={<Servicos />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/atendimentos" element={<Atendimentos />} />
              <Route path="/configuracoes" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </TooltipProvider>
    </DataProvider>
  </QueryClientProvider>
);

export default App;
