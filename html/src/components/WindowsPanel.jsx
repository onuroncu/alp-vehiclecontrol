import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp } from 'lucide-react';

/**
 * WindowsPanel — controls for each vehicle window.
 *
 * @param {object} props
 * @param {number} props.doorCount - Number of windows (matches door count)
 * @param {number[]} props.rolledDownWindows - Array of window indices that are rolled down
 * @param {object} props.translation - Translation strings
 * @param {function} props.onToggleWindow - Callback to toggle a window (windowIndex)
 */
export default function WindowsPanel({
  doorCount = 0,
  rolledDownWindows = [],
  translation = {},
  onToggleWindow,
}) {
  const downSet = new Set(rolledDownWindows);

  const windowLabels = {
    0: `${translation?.window_prefix || 'Window'} 1 (FL)`,
    1: `${translation?.window_prefix || 'Window'} 2 (FR)`,
    2: `${translation?.window_prefix || 'Window'} 3 (RL)`,
    3: `${translation?.window_prefix || 'Window'} 4 (RR)`,
  };

  const windows = [];
  for (let i = 0; i < Math.min(doorCount, 4); i++) {
    windows.push(i);
  }

  if (windows.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No windows available on this vehicle.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 animate-slide-in">
      {windows.map((windowIndex) => {
        const isDown = downSet.has(windowIndex);
        return (
          <Button
            key={windowIndex}
            variant={isDown ? 'default' : 'secondary'}
            className={`flex items-center justify-between gap-2 h-12 transition-all duration-200 ${
              isDown
                ? 'bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-600/20'
                : 'hover:bg-secondary/80'
            }`}
            onClick={() => onToggleWindow(windowIndex)}
          >
            <span className="flex items-center gap-2">
              {isDown ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
              <span className="text-xs font-medium">
                {windowLabels[windowIndex] ||
                  `${translation?.window_prefix || 'Window'} ${windowIndex + 1}`}
              </span>
            </span>
            <Badge
              variant={isDown ? 'warning' : 'success'}
              className="text-[10px] px-1.5 py-0"
            >
              {isDown
                ? translation?.down || 'Down'
                : translation?.up || 'Up'}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
}
