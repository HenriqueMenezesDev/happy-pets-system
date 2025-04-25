
import { toast } from '@/hooks/use-toast';

export const handleError = (error: any, operacao: string) => {
  console.error(`Erro ao ${operacao}:`, error);
  toast({
    title: `Erro ao ${operacao}`,
    description: error.message,
    variant: 'destructive'
  });
};
