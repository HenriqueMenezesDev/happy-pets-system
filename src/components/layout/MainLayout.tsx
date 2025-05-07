
import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  PawPrint,
  Calendar,
  Package,
  Settings, 
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, isGerente } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Função para obter as iniciais do nome do usuário
  const getUserInitials = () => {
    if (!user || !user.nome) return '?';
    
    const nameParts = user.nome.trim().split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
  };

  // Filtrar itens da sidebar baseado no perfil do usuário
  const getSidebarItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/', icon: Home },
      { name: 'Clientes', href: '/clientes', icon: Users },
      { name: 'Pets', href: '/pets', icon: PawPrint },
      { name: 'Atendimentos', href: '/atendimentos', icon: Calendar },
    ];
    
    // Itens para gerentes e admin
    if (isGerente) {
      baseItems.push(
        { name: 'Serviços', href: '/servicos', icon: Calendar },
        { name: 'Produtos', href: '/produtos', icon: Package },
        { name: 'Funcionários', href: '/funcionarios', icon: Users }
      );
    }
    
    // Itens apenas para admin
    if (isAdmin) {
      baseItems.push(
        { name: 'Config. Horários', href: '/admin/horarios', icon: Settings },
        { name: 'Admin Agendamentos', href: '/admin/agendamentos', icon: Calendar },
        { name: 'Lembretes de Email', href: '/admin/lembretes-email', icon: Calendar }
      );
    }
    
    return baseItems;
  };

  const sidebarItems = getSidebarItems();

  return (
    <div className="flex min-h-screen relative">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 z-30 md:hidden" 
          onClick={toggleSidebar} 
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed z-40 md:relative md:z-auto inset-y-0 left-0 border-r bg-sidebar transform transition-transform duration-200 ease-in-out",
          "w-64 flex-shrink-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PawPrint className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Happy Pets</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Separator />
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="px-2 space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10 border-b">
          <div className="px-4 py-3 flex justify-between items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="ml-auto flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 hidden md:block">
                {user?.nome} 
                <span className="text-xs ml-1 px-2 py-0.5 bg-gray-100 rounded-full">
                  {user?.perfil}
                </span>
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{user?.nome}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
