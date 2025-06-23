'use client';

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Edit, Save, X, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/context/user-profile-context';


export function ProfileCard() {
  const { toast } = useToast();
  const { profile, updateProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  
  // State for editable data
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file) {
        toast({
            variant: 'destructive',
            title: 'Archivo Inválido',
            description: 'Por favor, seleccione un archivo de imagen válido.',
        });
    }
  };

  const handleEditClick = () => {
    setName(profile.name);
    setEmail(profile.email);
    setPhone(profile.phone);
    setAvatarPreview(profile.avatar);
    setIsEditing(true);
  };

  const handleSave = () => {
    const updatedUserData = { name, email, phone, avatar: avatarPreview };
    updateProfile(updatedUserData);
    setIsEditing(false);
    toast({
      title: 'Perfil Actualizado',
      description: 'Su información ha sido guardada exitosamente.',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div 
          className="relative w-24 h-24 mx-auto mb-4 group"
          onClick={handleAvatarClick}
        >
          <Avatar className="w-24 h-24">
            <AvatarImage src={isEditing ? avatarPreview : profile.avatar} alt={profile.name} data-ai-hint="user avatar" />
            <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          {isEditing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer transition-opacity opacity-0 group-hover:opacity-100">
              <Camera className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />

        <CardTitle className="text-3xl font-headline">{profile.name}</CardTitle>
        <CardDescription className="text-lg text-primary">{profile.role}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} readOnly={!isEditing} className="pl-10" />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Dirección de Correo Electrónico</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} readOnly={!isEditing} className="pl-10" />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="phone">Número de Teléfono</Label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} readOnly={!isEditing} className="pl-10" />
                </div>
            </div>
        </div>
        
        {isEditing ? (
          <div className="flex gap-4">
            <Button className="w-full" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Guardar Cambios
            </Button>
            <Button variant="outline" className="w-full" onClick={handleCancel}>
               <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={handleEditClick}>
            <Edit className="mr-2 h-4 w-4" /> Editar Perfil
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
