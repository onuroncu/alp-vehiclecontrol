import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Lightbulb,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Lamp,
} from 'lucide-react';

/**
 * LightsPanel — controls for headlights, hazards, turn signals, and interior light.
 *
 * @param {object} props
 * @param {number} props.indicatorLights - Indicator state: 0=none, 1=left, 2=right, 3=both (hazard)
 * @param {boolean} props.headlightsOn - Whether headlights are on
 * @param {boolean} props.interiorLightOn - Whether interior light is on
 * @param {object} props.features - Feature toggles from config
 * @param {object} props.translation - Translation strings
 * @param {function} props.onToggleHeadlights
 * @param {function} props.onToggleHazards
 * @param {function} props.onToggleLeftSignal
 * @param {function} props.onToggleRightSignal
 * @param {function} props.onToggleInteriorLight
 */
export default function LightsPanel({
  indicatorLights = 0,
  headlightsOn = false,
  interiorLightOn = false,
  features = {},
  translation = {},
  onToggleHeadlights,
  onToggleHazards,
  onToggleLeftSignal,
  onToggleRightSignal,
  onToggleInteriorLight,
}) {
  const leftOn = indicatorLights === 1 || indicatorLights === 3;
  const rightOn = indicatorLights === 2 || indicatorLights === 3;
  const hazardsOn = indicatorLights === 3;

  return (
    <div className="space-y-3 animate-slide-in">
      {/* Headlights */}
      {features.headlights !== false && (
        <div
          className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
            headlightsOn
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-secondary/50 border-border'
          }`}
        >
          <div className="flex items-center gap-3">
            <Lightbulb
              className={`h-5 w-5 transition-colors ${
                headlightsOn ? 'text-amber-400' : 'text-muted-foreground'
              }`}
            />
            <div>
              <p className="text-sm font-medium">
                {translation?.headlights || 'Headlights'}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {headlightsOn
                  ? translation?.on || 'ON'
                  : translation?.off || 'OFF'}
              </p>
            </div>
          </div>
          <Switch
            checked={headlightsOn}
            onCheckedChange={onToggleHeadlights}
          />
        </div>
      )}

      {/* Interior Light */}
      {features.interiorLight !== false && (
        <div
          className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
            interiorLightOn
              ? 'bg-yellow-500/10 border-yellow-500/30'
              : 'bg-secondary/50 border-border'
          }`}
        >
          <div className="flex items-center gap-3">
            <Lamp
              className={`h-5 w-5 transition-colors ${
                interiorLightOn ? 'text-yellow-300' : 'text-muted-foreground'
              }`}
            />
            <div>
              <p className="text-sm font-medium">
                {translation?.interior_light || 'Interior Light'}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {interiorLightOn
                  ? translation?.on || 'ON'
                  : translation?.off || 'OFF'}
              </p>
            </div>
          </div>
          <Switch
            checked={interiorLightOn}
            onCheckedChange={onToggleInteriorLight}
          />
        </div>
      )}

      {/* Hazard Lights */}
      {features.hazardLights !== false && (
        <Button
          variant={hazardsOn ? 'default' : 'secondary'}
          className={`w-full h-12 transition-all duration-200 ${
            hazardsOn
              ? 'bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/30'
              : 'hover:bg-secondary/80'
          }`}
          onClick={onToggleHazards}
        >
          <AlertTriangle
            className={`h-5 w-5 mr-2 ${hazardsOn ? 'animate-pulse' : ''}`}
          />
          <span className="text-sm font-medium">
            {translation?.hazards || 'Hazard Lights'}
          </span>
          {hazardsOn && (
            <Badge variant="warning" className="ml-2 text-[10px] px-1.5 py-0">
              {translation?.on || 'ON'}
            </Badge>
          )}
        </Button>
      )}

      {/* Turn Signals */}
      {features.turnSignals !== false && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={leftOn && !hazardsOn ? 'default' : 'secondary'}
            className={`h-12 transition-all duration-200 ${
              leftOn && !hazardsOn
                ? 'bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20'
                : 'hover:bg-secondary/80'
            }`}
            onClick={onToggleLeftSignal}
          >
            <ArrowLeft
              className={`h-4 w-4 mr-2 ${leftOn && !hazardsOn ? 'animate-pulse' : ''}`}
            />
            <span className="text-xs font-medium">
              {translation?.left_signal || 'Left Signal'}
            </span>
          </Button>
          <Button
            variant={rightOn && !hazardsOn ? 'default' : 'secondary'}
            className={`h-12 transition-all duration-200 ${
              rightOn && !hazardsOn
                ? 'bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20'
                : 'hover:bg-secondary/80'
            }`}
            onClick={onToggleRightSignal}
          >
            <span className="text-xs font-medium">
              {translation?.right_signal || 'Right Signal'}
            </span>
            <ArrowRight
              className={`h-4 w-4 ml-2 ${rightOn && !hazardsOn ? 'animate-pulse' : ''}`}
            />
          </Button>
        </div>
      )}
    </div>
  );
}
