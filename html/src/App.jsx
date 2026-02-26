import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DoorOpen,
  DoorClosed,
  CarFront,
  Package,
  ArrowDown,
  ArrowUp,
  Lightbulb,
  LightbulbOff,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Lamp,
  Power,
  User,
  UserCheck,
  X,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { postNUI, isEnvBrowser } from '@/lib/utils';

// ============================================================================
// Mock data
// ============================================================================
const MOCK_VEHICLE_DATA = {
  doors: 4,
  seats: 4,
  currentSeat: -1,
  engineOn: true,
  indicatorLights: 0,
  openDoors: [1],
  rolledDownWindows: [0],
  interiorLight: false,
  headlights: true,
  highBeams: false,
  hasHood: true,
  hasTrunk: true,
};

const MOCK_CONFIG = {
  features: {
    doors: true,
    windows: true,
    engine: true,
    seats: true,
    hazardLights: true,
    turnSignals: true,
    headlights: true,
    interiorLight: true,
  },
  translation: {
    door_prefix: 'Door',
    door_hood: 'Hood',
    door_trunk: 'Trunk',
    window_prefix: 'Window',
    seat_driver: 'Driver',
    seat_passenger: 'Passenger',
    seat_rear: 'Rear',
    engine_on: 'Engine ON',
    engine_off: 'Engine OFF',
    hazards: 'Hazards',
    left_signal: 'Left Signal',
    right_signal: 'Right Signal',
    headlights: 'Headlights',
    interior_light: 'Interior Light',
    open: 'Open',
    closed: 'Closed',
    compact: 'Compact',
    default_mode: 'Default',
  },
};

// ============================================================================
// Segmented Control
// ============================================================================
function SegmentedControl({ value, onChange, options }) {
  return (
    <div className="relative flex items-center bg-white/[0.04] rounded-lg p-0.5 gap-0.5 shrink-0">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-200 whitespace-nowrap ${
              isActive
                ? 'bg-white/[0.1] text-white'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Unified button — renders icon-only or icon+label based on compact prop.
// In compact mode wraps with Tooltip; in default mode shows inline label.
// Uses CSS transition on width via inline style for smooth morphing.
// ============================================================================
function CtrlBtn({ tooltip, label, active, activeClass, onClick, disabled, compact, children }) {
  const base = `inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${
    active
      ? activeClass || 'bg-primary hover:bg-primary/90 text-primary-foreground'
      : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.06]'
  } ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`;

  const btn = (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`${base} h-9 ${compact ? 'w-9 px-0 justify-center' : 'px-3 gap-2'}`}
    >
      <span className="shrink-0 flex items-center justify-center w-4 h-4">{children}</span>
      {!compact && (
        <span className="text-[11px] font-medium whitespace-nowrap">
          {label}
        </span>
      )}
    </button>
  );

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{btn}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs">{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return btn;
}

// Vertical separator
function Sep() {
  return <div className="w-px h-6 bg-white/10 mx-0.5 shrink-0" />;
}

// ============================================================================
// Main App
// ============================================================================
export default function App() {
  const [visible, setVisible] = useState(isEnvBrowser());
  const [vehicleData, setVehicleData] = useState(
    isEnvBrowser() ? MOCK_VEHICLE_DATA : null
  );
  const [config, setConfig] = useState(
    isEnvBrowser() ? MOCK_CONFIG : { features: {}, translation: {} }
  );
  const [mode, setMode] = useState('compact');

  const translation = config.translation || {};
  const features = config.features || {};
  const compact = mode === 'compact';

  // --------------------------------------------------------------------------
  // NUI Message Handler
  // --------------------------------------------------------------------------
  const handleMessage = useCallback((event) => {
    const { action, data } = event.data;
    switch (action) {
      case 'setVisible':
        setVisible(data);
        break;
      case 'vehicleData':
        setVehicleData(data);
        break;
      case 'config':
        setConfig(data);
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && visible) closeMenu();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible]);

  const closeMenu = () => {
    setVisible(false);
    postNUI('hideFrame');
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  if (!visible || !vehicleData) return null;

  const openSet = new Set(vehicleData.openDoors || []);
  const downSet = new Set(vehicleData.rolledDownWindows || []);
  const leftOn = vehicleData.indicatorLights === 1 || vehicleData.indicatorLights === 3;
  const rightOn = vehicleData.indicatorLights === 2 || vehicleData.indicatorLights === 3;
  const hazardsOn = vehicleData.indicatorLights === 3;
  const currentDisplaySeat = (vehicleData.currentSeat ?? -1) + 1;

  // Build lists
  const doors = [];
  for (let i = 0; i < vehicleData.doors; i++) doors.push(i);
  if (vehicleData.hasHood) doors.push(4);
  if (vehicleData.hasTrunk) doors.push(5);

  const windows = [];
  for (let i = 0; i < Math.min(vehicleData.doors, 4); i++) windows.push(i);

  const seats = [];
  for (let i = 0; i < vehicleData.seats; i++) seats.push(i);

  // Helpers
  const doorLabel = (i) => {
    if (i === 4) return translation.door_hood || 'Hood';
    if (i === 5) return translation.door_trunk || 'Trunk';
    return `${translation.door_prefix || 'Door'} ${i + 1}`;
  };

  const doorIcon = (i, isOpen) => {
    if (i === 4) return <CarFront className="h-4 w-4" />;
    if (i === 5) return <Package className="h-4 w-4" />;
    return isOpen ? <DoorOpen className="h-4 w-4" /> : <DoorClosed className="h-4 w-4" />;
  };

  const seatLabel = (i) => {
    if (i === 0) return translation.seat_driver || 'Driver';
    if (i === 1) return translation.seat_passenger || 'Passenger';
    return `${translation.seat_rear || 'Rear'} ${i - 1}`;
  };

  // Sections
  const showDoors = features.doors !== false && doors.length > 0;
  const showWindows = features.windows !== false && windows.length > 0;
  const showLights =
    features.headlights !== false ||
    features.hazardLights !== false ||
    features.turnSignals !== false ||
    features.interiorLight !== false;
  const showEngine = features.engine !== false;
  const showSeats = features.seats !== false && seats.length > 1;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="fixed inset-0 flex items-end justify-center pb-8 pointer-events-none select-none">
        {/* Single bar — flex-wrap + max-w in default mode creates horizontal rectangle expanding upward */}
        <div
          className={`flex flex-wrap items-center justify-center gap-1 px-3 py-2 rounded-xl bg-[#111113]/90 border border-white/[0.06] pointer-events-auto transition-all duration-300 ease-in-out ${
            compact ? '' : 'max-w-[720px]'
          } ${visible ? 'animate-fade-in' : 'animate-fade-out'}`}
        >
          {/* Mode Switch */}
          <SegmentedControl
            value={mode}
            onChange={setMode}
            options={[
              { value: 'compact', label: translation.compact || 'Compact', icon: <Minimize2 className="h-3 w-3" /> },
              { value: 'default', label: translation.default_mode || 'Default', icon: <Maximize2 className="h-3 w-3" /> },
            ]}
          />
          <Sep />

          {/* Doors */}
          {showDoors && doors.map((di) => {
            const isOpen = openSet.has(di);
            return (
              <CtrlBtn
                key={`d${di}`}
                compact={compact}
                tooltip={`${doorLabel(di)} — ${isOpen ? translation.open || 'Open' : translation.closed || 'Closed'}`}
                label={doorLabel(di)}
                active={isOpen}
                activeClass="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => postNUI('toggleDoor', { doorIndex: di })}
              >
                {doorIcon(di, isOpen)}
              </CtrlBtn>
            );
          })}

          {/* Windows */}
          {showDoors && showWindows && <Sep />}
          {showWindows && windows.map((wi) => {
            const isDown = downSet.has(wi);
            return (
              <CtrlBtn
                key={`w${wi}`}
                compact={compact}
                tooltip={`${translation.window_prefix || 'Window'} ${wi + 1} — ${isDown ? '▼' : '▲'}`}
                label={`${translation.window_prefix || 'Win'} ${wi + 1}`}
                active={isDown}
                activeClass="bg-sky-600 hover:bg-sky-700 text-white"
                onClick={() => postNUI('toggleWindow', { windowIndex: wi })}
              >
                {isDown ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
              </CtrlBtn>
            );
          })}

          {/* Lights */}
          {(showDoors || showWindows) && showLights && <Sep />}
          {features.headlights !== false && (
            <CtrlBtn
              compact={compact}
              tooltip={translation.headlights || 'Headlights'}
              label={translation.headlights || 'Headlights'}
              active={vehicleData.headlights}
              activeClass="bg-amber-500 hover:bg-amber-600 text-black"
              onClick={() => postNUI('toggleHeadlights')}
            >
              {vehicleData.headlights ? <Lightbulb className="h-4 w-4" /> : <LightbulbOff className="h-4 w-4" />}
            </CtrlBtn>
          )}
          {features.hazardLights !== false && (
            <CtrlBtn
              compact={compact}
              tooltip={translation.hazards || 'Hazards'}
              label={translation.hazards || 'Hazards'}
              active={hazardsOn}
              activeClass="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => postNUI('toggleHazards')}
            >
              <AlertTriangle className={`h-4 w-4 ${hazardsOn ? 'animate-pulse' : ''}`} />
            </CtrlBtn>
          )}
          {features.turnSignals !== false && (
            <>
              <CtrlBtn
                compact={compact}
                tooltip={translation.left_signal || 'Left Signal'}
                label={translation.left_signal || 'Left'}
                active={leftOn && !hazardsOn}
                activeClass="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => postNUI('toggleLeftSignal')}
              >
                <ArrowLeft className={`h-4 w-4 ${leftOn && !hazardsOn ? 'animate-pulse' : ''}`} />
              </CtrlBtn>
              <CtrlBtn
                compact={compact}
                tooltip={translation.right_signal || 'Right Signal'}
                label={translation.right_signal || 'Right'}
                active={rightOn && !hazardsOn}
                activeClass="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => postNUI('toggleRightSignal')}
              >
                <ArrowRight className={`h-4 w-4 ${rightOn && !hazardsOn ? 'animate-pulse' : ''}`} />
              </CtrlBtn>
            </>
          )}
          {features.interiorLight !== false && (
            <CtrlBtn
              compact={compact}
              tooltip={translation.interior_light || 'Interior Light'}
              label={translation.interior_light || 'Interior'}
              active={vehicleData.interiorLight}
              activeClass="bg-yellow-400 hover:bg-yellow-500 text-black"
              onClick={() => postNUI('toggleInteriorLight')}
            >
              <Lamp className="h-4 w-4" />
            </CtrlBtn>
          )}

          {/* Engine */}
          {showLights && showEngine && <Sep />}
          {showEngine && (
            <CtrlBtn
              compact={compact}
              tooltip={vehicleData.engineOn ? (translation.engine_on || 'Engine ON') : (translation.engine_off || 'Engine OFF')}
              label={vehicleData.engineOn ? (translation.engine_on || 'Engine ON') : (translation.engine_off || 'Engine OFF')}
              active={vehicleData.engineOn}
              activeClass="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => postNUI('toggleEngine')}
            >
              <Power className="h-4 w-4" />
            </CtrlBtn>
          )}

          {/* Seats */}
          {showEngine && showSeats && <Sep />}
          {showSeats && seats.map((si) => {
            const isCurrent = si === currentDisplaySeat;
            return (
              <CtrlBtn
                key={`s${si}`}
                compact={compact}
                tooltip={seatLabel(si)}
                label={seatLabel(si)}
                active={isCurrent}
                activeClass="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isCurrent}
                onClick={() => postNUI('switchSeat', { seatIndex: si })}
              >
                {isCurrent ? <UserCheck className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </CtrlBtn>
            );
          })}

          {/* Close */}
          <Sep />
          <CtrlBtn compact={true} tooltip="Close" label="" onClick={closeMenu}>
            <X className="h-4 w-4" />
          </CtrlBtn>
        </div>
      </div>
    </TooltipProvider>
  );
}
