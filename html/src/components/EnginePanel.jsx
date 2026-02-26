import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Power } from 'lucide-react';

/**
 * EnginePanel — toggle engine on/off with visual state indicator.
 *
 * @param {object} props
 * @param {boolean} props.engineOn - Whether the engine is currently running
 * @param {object} props.translation - Translation strings
 * @param {function} props.onToggleEngine - Callback to toggle the engine
 */
export default function EnginePanel({
  engineOn = false,
  translation = {},
  onToggleEngine,
}) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-4 animate-slide-in">
      {/* Large Engine Toggle Button */}
      <button
        onClick={onToggleEngine}
        className={`relative w-24 h-24 rounded-full border-4 transition-all duration-300 flex items-center justify-center group ${
          engineOn
            ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/30 hover:bg-emerald-500/20'
            : 'border-red-500/50 bg-red-500/5 shadow-lg shadow-red-500/10 hover:bg-red-500/10'
        }`}
      >
        <Power
          className={`h-10 w-10 transition-all duration-300 ${
            engineOn
              ? 'text-emerald-400 group-hover:text-emerald-300'
              : 'text-red-400 group-hover:text-red-300'
          }`}
        />
        {/* Pulsing ring when engine is on */}
        {engineOn && (
          <span className="absolute inset-0 rounded-full border-2 border-emerald-500/50 animate-ping" />
        )}
      </button>

      {/* Status */}
      <div className="text-center space-y-1">
        <Badge
          variant={engineOn ? 'success' : 'destructive'}
          className="text-sm px-3 py-1"
        >
          {engineOn
            ? translation?.engine_on || 'Engine ON'
            : translation?.engine_off || 'Engine OFF'}
        </Badge>
        <p className="text-xs text-muted-foreground">
          {engineOn ? 'Click to turn off' : 'Click to start'}
        </p>
      </div>
    </div>
  );
}
