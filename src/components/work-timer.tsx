
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Square, Timer, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { notifyTimerStart, notifyTimerPause, notifyTimerResume, notifyTimerStop, getReportById } from '@/app/actions';
import { useUserProfile } from '@/context/user-profile-context';

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
  const [reportId, setReportId] = useState('');
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { profile } = useUserProfile();

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
      const savedActiveReportId = localStorage.getItem('workTimerActiveReportId');

      if (savedState && savedStartTime && savedActiveReportId) {
        const start = parseInt(savedStartTime, 10);
        setStartTime(start);
        setTimerState(savedState);
        setActiveReportId(savedActiveReportId);
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

  const handleStart = async () => {
    const report = await getReportById(reportId);

    if (!report) {
        toast({
            variant: 'destructive',
            title: "Reporte no encontrado",
            description: `El reporte con ID "${reportId}" no fue encontrado.`,
        });
        return;
    }

    if (['Completado', 'Cancelado'].includes(report.status)) {
        toast({
            variant: 'destructive',
            title: "Acción No Permitida",
            description: `El reporte "${reportId}" ya está ${report.status.toLowerCase()} y no se puede iniciar un temporizador.`,
        });
        return;
    }

    const now = Date.now();
    setStartTime(now);
    setTimerState('running');
    setElapsedTime(0);
    setActiveReportId(reportId);
    
    notifyTimerStart({ reportId, technicianName: profile.name }).catch(err => {
        toast({ variant: 'destructive', title: "Error de Notificación", description: err.message });
    });

    try {
      localStorage.setItem('workTimerState', 'running');
      localStorage.setItem('workTimerStartTime', now.toString());
      localStorage.setItem('workTimerActiveReportId', reportId);
      localStorage.removeItem('workTimerElapsedTime');
    } catch (error) { console.error("Could not save timer state", error); }
  };

  const handlePause = () => {
    setTimerState('paused');
    if (activeReportId) {
        notifyTimerPause({ reportId: activeReportId, technicianName: profile.name }).catch(err => {
            toast({ variant: 'destructive', title: "Error de Notificación", description: err.message });
        });
    }
    try {
      localStorage.setItem('workTimerState', 'paused');
      localStorage.setItem('workTimerElapsedTime', elapsedTime.toString());
    } catch (error) { console.error("Could not save timer state", error); }
  };

  const handleResume = () => {
    const now = Date.now();
    setStartTime(now - elapsedTime * 1000);
    setTimerState('running');
    if (activeReportId) {
        notifyTimerResume({ reportId: activeReportId, technicianName: profile.name }).catch(err => {
            toast({ variant: 'destructive', title: "Error de Notificación", description: err.message });
        });
    }
    try {
      localStorage.setItem('workTimerState', 'running');
      localStorage.setItem('workTimerStartTime', (now - elapsedTime * 1000).toString());
      localStorage.removeItem('workTimerElapsedTime');
    } catch (error) { console.error("Could not save timer state", error); }
  };

  const handleStop = async () => {
    const finalElapsedTime = elapsedTime;
    const finalReportId = activeReportId;

    if (!finalReportId) return;

    try {
        await notifyTimerStop({ reportId: finalReportId, elapsedTimeInSeconds: finalElapsedTime });
        toast({
            title: "Temporizador Detenido y Reportado",
            description: `Se ha reportado un tiempo de ${formatTime(finalElapsedTime)} para el reporte ${finalReportId}.`,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error.';
        toast({
            variant: 'destructive',
            title: "Error al Reportar",
            description: errorMessage,
        });
    } finally {
        setTimerState('idle');
        setElapsedTime(0);
        setStartTime(null);
        setReportId('');
        setActiveReportId(null);
        try {
            localStorage.removeItem('workTimerState');
            localStorage.removeItem('workTimerStartTime');
            localStorage.removeItem('workTimerElapsedTime');
            localStorage.removeItem('workTimerActiveReportId');
        } catch(error) { console.error("Could not remove timer state", error); }
    }
  };

  const timerColorClass = {
    running: 'text-primary',
    paused: 'text-yellow-500',
    idle: 'text-destructive',
  }[timerState];

  const isTimerActive = timerState === 'running' || timerState === 'paused';

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Timer className="w-6 h-6 text-primary" />
          <CardTitle className="font-headline">Control de Horas</CardTitle>
        </div>
        <CardDescription>
          {isTimerActive
              ? `Tiempo corriendo para el reporte: ${activeReportId}`
              : "Ingrese el ID del reporte para iniciar el temporizador."
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4 pt-6">
        <div className={cn("text-4xl font-mono font-bold tracking-widest", timerColorClass)}>
          {formatTime(elapsedTime)}
        </div>

        {!isTimerActive && (
          <div className="w-full max-w-xs space-y-4">
              <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="reportId">ID de Reporte</Label>
                  <Input 
                      id="reportId" 
                      placeholder="Ej: OT-123, MR-456" 
                      value={reportId} 
                      onChange={(e) => setReportId(e.target.value)} 
                  />
              </div>
              <Button onClick={handleStart} className="w-full" disabled={!reportId}>
                  <Play className="mr-2 h-5 w-5" />
                  Comenzar
              </Button>
          </div>
        )}

        {isTimerActive && (
             <div className="flex gap-4">
                {timerState === 'running' && (
                    <>
                    <Button size="icon" onClick={handlePause} variant="outline" className="h-12 w-12 rounded-full border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-600">
                        <Pause className="h-6 w-6" />
                    </Button>
                    <Button size="icon" onClick={handleStop} variant="destructive" className="h-12 w-12 rounded-full">
                        <Square className="h-6 w-6" />
                    </Button>
                    </>
                )}
                {timerState === 'paused' && (
                    <>
                    <Button size="icon" onClick={handleResume} className="h-12 w-12 rounded-full">
                        <Play className="h-6 w-6" />
                    </Button>
                    <Button size="icon" onClick={handleStop} variant="destructive" className="h-12 w-12 rounded-full">
                        <Square className="h-6 w-6" />
                    </Button>
                    </>
                )}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
