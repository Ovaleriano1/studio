'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Square, Timer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return [hours, minutes, seconds]
    .map(v => v.toString().padStart(2, '0'))
    .join(':');
};

export function WorkTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedStartTime = localStorage.getItem('workTimerStartTime');
      if (savedStartTime) {
        const start = parseInt(savedStartTime, 10);
        setStartTime(start);
        setIsRunning(true);
      }
    } catch (error) {
        console.error("Could not load timer state from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isRunning && startTime) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, startTime]);

  const handleStart = () => {
    const now = Date.now();
    setStartTime(now);
    setIsRunning(true);
    setElapsedTime(0);
    try {
      localStorage.setItem('workTimerStartTime', now.toString());
    } catch (error) {
       console.error("Could not save timer state to localStorage", error);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    toast({
        title: "Temporizador Detenido",
        description: `Se ha registrado un tiempo de trabajo de ${formatTime(elapsedTime)}.`,
    });
    
    setElapsedTime(0);
    setStartTime(null);
    try {
      localStorage.removeItem('workTimerStartTime');
    } catch(error) {
        console.error("Could not remove timer state from localStorage", error);
    }
  };

  return (
    <Card className="h-full">
        <CardHeader>
            <div className="flex items-center gap-2">
                <Timer className="w-6 h-6 text-primary" />
                <CardTitle className="font-headline">Control de Horas</CardTitle>
            </div>
            <CardDescription>
                Inicie el temporizador cuando comience a trabajar en una orden.
            </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 pt-6">
            <div className="text-5xl font-mono font-bold tracking-widest text-primary md:text-6xl">
                {formatTime(elapsedTime)}
            </div>
            <div className="flex gap-4">
                {!isRunning ? (
                    <Button size="lg" onClick={handleStart} className="w-40">
                        <Play className="mr-2" />
                        Comenzar
                    </Button>
                ) : (
                    <Button size="lg" onClick={handleStop} variant="destructive" className="w-40">
                        <Square className="mr-2" />
                        Detener
                    </Button>
                )}
            </div>
        </CardContent>
    </Card>
  );
}
