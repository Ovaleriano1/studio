'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon } from 'lucide-react';
import { Button } from './ui/button';

export function SettingsView() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-primary" />
            <CardTitle>Configuración de la Aplicación</CardTitle>
        </div>
        <CardDescription>Administre sus preferencias y configuraciones de la aplicación.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="theme" className="flex flex-col space-y-1">
            <span>Tema</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Seleccione el tema de la aplicación.
            </span>
          </Label>
          <Select defaultValue="system">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar tema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Claro</SelectItem>
              <SelectItem value="dark">Oscuro</SelectItem>
              <SelectItem value="system">Sistema</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
            <span>Notificaciones por Correo Electrónico</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Reciba notificaciones sobre nuevos formularios y actualizaciones.
            </span>
          </Label>
          <Switch id="email-notifications" defaultChecked />
        </div>
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
            <span>Notificaciones Push</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Reciba notificaciones push en su dispositivo móvil.
            </span>
          </Label>
          <Switch id="push-notifications" />
        </div>
      </CardContent>
      <CardFooter className='border-t pt-6'>
          <Button>Aplicar Cambios</Button>
      </CardFooter>
    </Card>
  );
}
