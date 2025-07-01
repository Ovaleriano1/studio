
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile, ROLES, type Role } from '@/context/user-profile-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const userCreationSchema = z.object({
  name: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  email: z.string().email({ message: 'Por favor ingrese un correo válido.' }),
  phone: z.string().min(8, { message: 'Se requiere un número de teléfono válido.' }),
  role: z.enum(ROLES, { required_error: 'Por favor seleccione un rol.' }),
});

type UserCreationValues = z.infer<typeof userCreationSchema>;

export function UserCreationForm() {
  const { toast } = useToast();
  const { createUser } = useUserProfile();

  const form = useForm<UserCreationValues>({
    resolver: zodResolver(userCreationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'user-technicians',
    },
  });
  
  const roleDisplayNames: Record<Role, string> = {
    admin: 'Administrador',
    superuser: 'Superusuario',
    supervisor: 'Supervisor',
    'user-technicians': 'Técnico',
  };

  async function onSubmit(data: UserCreationValues) {
    try {
      createUser(data);
      toast({
        title: '¡Usuario Creado!',
        description: `El usuario ${data.name} ha sido creado exitosamente.`,
      });
      form.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
      toast({
        variant: 'destructive',
        title: 'Error al Crear Usuario',
        description: errorMessage,
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-primary" />
            <CardTitle>Crear Nuevo Usuario</CardTitle>
        </div>
        <CardDescription>
          Añada nuevos usuarios al sistema. Deberá crear la cuenta de autenticación correspondiente en Firebase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="+504 1234-5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROLES.map((r) => (
                           <SelectItem key={r} value={r}>{roleDisplayNames[r]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full md:w-auto">
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                 <UserPlus className="mr-2 h-4 w-4" />
                 Crear Usuario
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
