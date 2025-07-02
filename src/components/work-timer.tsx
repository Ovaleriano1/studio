
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Square, Timer, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type TimerState = 'idle' | 'running' | 'paused';

const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return [hours, minutes, seconds]
    .map(v => v.toString().padStart(2, '0'))
    .join(':');
};

export function WorkTimer() {
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const clearTimerInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('workTimerState') as TimerState | null;
      const savedStartTime = localStorage.getItem('workTimerStartTime');
      const savedElapsedTime = localStorage.getItem('workTimerElapsedTime');

      if (savedState && savedStartTime) {
        const start = parseInt(savedStartTime, 10);
        setStartTime(start);
        setTimerState(savedState);
        if (savedState === 'paused' && savedElapsedTime) {
          setElapsedTime(parseFloat(savedElapsedTime));
        }
      }
    } catch (error) {
      console.error("Could not load timer state from localStorage", error);
    }
  }, []);

  // Timer interval logic
  useEffect(() => {
    if (timerState === 'running' && startTime !== null) {
      clearTimerInterval(); // Ensure no multiple intervals running
      intervalRef.current = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
      }, 1000);
    } else {
      clearTimerInterval();
    }
    return clearTimerInterval;
  }, [timerState, startTime]);

  const handleStart = () => {
    const now = Date.now();
    setStartTime(now);
    setTimerState('running');
    setElapsedTime(0);
    try {
      localStorage.setItem('workTimerState', 'running');
      localStorage.setItem('workTimerStartTime', now.toString());
      localStorage.removeItem('workTimerElapsedTime');
    } catch (error) { console.error("Could not save timer state", error); }
  };

  const handlePause = () => {
    setTimerState('paused');
    try {
      localStorage.setItem('workTimerState', 'paused');
      localStorage.setItem('workTimerElapsedTime', elapsedTime.toString());
    } catch (error) { console.error("Could not save timer state", error); }
  };

  const handleResume = () => {
    const now = Date.now();
    setStartTime(now - elapsedTime * 1000);
    setTimerState('running');
    try {
      localStorage.setItem('workTimerState', 'running');
      localStorage.setItem('workTimerStartTime', (now - elapsedTime * 1000).toString());
      localStorage.removeItem('workTimerElapsedTime');
    } catch (error) { console.error("Could not save timer state", error); }
  };

  const handleStop = () => {
    toast({
      title: "Temporizador Detenido",
      description: `Se ha registrado un tiempo de trabajo de ${formatTime(elapsedTime)}.`,
    });
    setTimerState('idle');
    setElapsedTime(0);
    setStartTime(null);
    try {
      localStorage.removeItem('workTimerState');
      localStorage.removeItem('workTimerStartTime');
      localStorage.removeItem('workTimerElapsedTime');
    } catch(error) { console.error("Could not remove timer state", error); }
  };

  const timerColorClass = {
    running: 'text-primary',
    paused: 'text-yellow-500',
    idle: 'text-destructive',
  }[timerState];

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
        <div className={cn("text-4xl font-mono font-bold tracking-widest", timerColorClass)}>
          {formatTime(elapsedTime)}
        </div>
        <div className="flex gap-4">
          {timerState === 'idle' && (
            <Button size="lg" onClick={handleStart} className="w-40">
              <Play className="mr-2" />
              Comenzar
            </Button>
          )}
          {timerState === 'running' && (
            <>
              <Button size="lg" onClick={handlePause} variant="outline" className="w-40 border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-600">
                <Pause className="mr-2" />
                Pausar
              </Button>
              <Button size="lg" onClick={handleStop} variant="destructive" className="w-40">
                <Square className="mr-2" />
                Detener
              </Button>
            </>
          )}
          {timerState === 'paused' && (
            <>
              <Button size="lg" onClick={handleResume} className="w-40">
                <Play className="mr-2" />
                Reanudar
              </Button>
              <Button size="lg" onClick={handleStop} variant="destructive" className="w-40">
                <Square className="mr-2" />
                Detener
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
