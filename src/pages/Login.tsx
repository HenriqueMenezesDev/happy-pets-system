
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

interface FormValues {
  email: string;
  senha: string;
}

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  
  // Obter a página de redirecionamento após o login, se existir
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  useEffect(() => {
    const checkIfSetupNeeded = async () => {
      try {
        setCheckingSetup(true);
        const { count, error } = await supabase
          .from('funcionarios')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error('Erro ao verificar funcionários:', error);
          return;
        }
        
        setNeedsSetup(!count || count === 0);
      } catch (err) {
        console.error('Erro ao verificar se precisa de setup:', err);
      } finally {
        setCheckingSetup(false);
      }
    };
    
    checkIfSetupNeeded();
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      email: '',
      senha: ''
    }
  });

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Redirecionar para setup se não houver funcionários
  useEffect(() => {
    if (needsSetup && !checkingSetup) {
      navigate('/setup');
    }
  }, [needsSetup, checkingSetup, navigate]);

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", data.email);
      const user = await login({
        email: data.email,
        senha: data.senha
      });
      
      if (user) {
        console.log("Login successful, user:", user);
        // Redirecionar para a página anterior ou para a página inicial
        navigate(from, { replace: true });
      } else {
        console.log("Login failed, no user returned");
        setError('Email ou senha inválidos');
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || 'Erro ao realizar login');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-8 w-8 text-primary"
              >
                <path d="M10 3.2C10 2.5 9.5 2 8.8 2 5.6 2 3 4.7 3 8.2s2.7 11.3 6 13.8c.5.4 1.3.4 1.8 0 3.3-2.5 6-8.3 6-11.8 0-4.2-2.6-7.2-6-7.2z" />
                <path d="M17 12c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
                <path d="M11.9 12.5c-.7.6-1.7 2-1.7 3.1 0 1.5 1.3 2 2.3 2s2.3-.5 2.3-2c0-.2 0-.3-.1-.4" />
              </svg>
              <h1 className="text-2xl font-bold text-primary">Happy Pets</h1>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Acesso ao Sistema</CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para acessar o painel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {needsSetup ? (
            <div className="text-center py-4">
              <p className="mb-4">Não há funcionários cadastrados no sistema.</p>
              <Button 
                onClick={() => navigate('/setup')}
                className="w-full"
              >
                Configuração Inicial
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    {...register("email", { 
                      required: "Email é obrigatório",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Email inválido"
                      }
                    })}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="senha">Senha</Label>
                  </div>
                  <Input
                    id="senha"
                    type="password"
                    {...register("senha", { required: "Senha é obrigatória" })}
                  />
                  {errors.senha && <p className="text-sm text-red-500">{errors.senha.message}</p>}
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center">
                      <Spinner className="mr-2 h-4 w-4" />
                      Entrando...
                    </span>
                  ) : "Entrar"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="mt-2 text-center text-sm text-gray-600">
            Não tem uma conta?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
