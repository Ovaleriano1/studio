'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Edit } from 'lucide-react';

export function ProfileCard() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarImage src="https://placehold.co/100x100.png" alt="Juan Gomez" data-ai-hint="user avatar" />
          <AvatarFallback>JG</AvatarFallback>
        </Avatar>
        <CardTitle className="text-3xl font-headline">Juan Gomez</CardTitle>
        <CardDescription className="text-lg text-primary">Tecnico</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="name" value="Juan Gomez" readOnly className="pl-10" />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="email" type="email" value="juan.gomez@promaintain.com" readOnly className="pl-10" />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="phone" type="tel" value="+1 (555) 123-4567" readOnly className="pl-10" />
                </div>
            </div>
        </div>
        <Button className="w-full">
          <Edit className="mr-2 h-4 w-4" /> Edit Profile
        </Button>
      </CardContent>
    </Card>
  );
}
