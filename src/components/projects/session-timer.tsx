"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SessionTimer() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;
  const display = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Session Timer</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-mono font-bold text-center mb-3">{display}</p>
        <div className="flex gap-2 justify-center">
          <Button
            size="sm"
            variant={running ? "destructive" : "default"}
            onClick={() => setRunning(!running)}
          >
            {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
          </Button>
          {elapsed > 0 && !running && (
            <Button size="sm" variant="outline" onClick={() => setElapsed(0)}>
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
