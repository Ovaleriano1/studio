'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon } from 'lucide-react';

export function SettingsView() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-primary" />
            <CardTitle>Application Settings</CardTitle>
        </div>
        <CardDescription>Manage your application preferences and settings.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="theme" className="flex flex-col space-y-1">
            <span>Theme</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Select the application theme.
            </span>
          </Label>
          <Select defaultValue="system">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
            <span>Email Notifications</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Receive notifications about new forms and updates.
            </span>
          </Label>
          <Switch id="email-notifications" defaultChecked />
        </div>
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
            <span>Push Notifications</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Get push notifications on your mobile device.
            </span>
          </Label>
          <Switch id="push-notifications" />
        </div>
      </CardContent>
    </Card>
  );
}
