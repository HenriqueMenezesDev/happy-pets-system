
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface FormValues {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

const Setup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormValues>({
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: ''
    }
  });

  const senha = watch('senha');

  const onSubmit = async (data: FormValues) => {
    if (data.senha !== data.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Verificar se já existem funcionários cadastrados
      const { count, error: countError } = await supabase
        .from('funcionarios')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      
      if (count && count > 0) {
        setError('Já existe um usuário administrador cadastrado. Por favor, faça login.');
        navigate('/login');
        return;
      }

      // Inserir o primeiro funcionário com perfil de admin
      const { data: novoFuncionario, error: insertError } = await supabase
        .from('funcionarios')
        .insert([
          {
            nome: data.nome,
            email: data.email,
            email_login: data.email,
            senha_hash: data.senha, // Em produção, isso deveria ser criptografado
            cargo: 'Administrador',
            perfil: 'admin',
            telefone: 'Não informado'
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: 'Cadastro realizado com sucesso!',
        description: 'O primeiro usuário administrador foi criado.',
      });

      navigate('/login');
    } catch (err: any) {
      console.error('Erro ao cadastrar usuário inicial:', err);
      setError(err.message || 'Erro ao cadastrar usuário inicial');
    } finally {
      setIsLoading(false);
    }
  };

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
          <CardTitle className="text-2xl font-bold text-center">Configuração Inicial</CardTitle>
          <CardDescription className="text-center">
            Crie o primeiro usuário administrador para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  {...register("nome", { required: "Nome é obrigatório" })}
                />
                {errors.nome && <p className="text-sm text-red-500">{errors.nome.message}</p>}
              </div>
              
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
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  {...register("senha", { 
                    required: "Senha é obrigatória",
                    minLength: {
                      value: 6,
                      message: "A senha deve ter pelo menos 6 caracteres"
                    }
                  })}
                />
                {errors.senha && <p className="text-sm text-red-500">{errors.senha.message}</p>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <Input
                  id="confirmarSenha"
                  type="password"
                  {...register("confirmarSenha", { 
                    required: "Confirme a senha",
                    validate: value => value === senha || "As senhas não coincidem"
                  })}
                />
                {errors.confirmarSenha && <p className="text-sm text-red-500">{errors.confirmarSenha.message}</p>}
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center">
                    <Spinner className="mr-2 h-4 w-4" />
                    Cadastrando...
                  </span>
                ) : "Criar Conta de Administrador"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="mt-2 text-center text-sm text-gray-600">
            Essa configuração só precisa ser feita uma vez.
            Após criar o primeiro administrador, você poderá gerenciar todos os funcionários pelo sistema.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Setup;
