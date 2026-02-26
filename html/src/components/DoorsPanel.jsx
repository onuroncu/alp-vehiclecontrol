import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DoorOpen,
  DoorClosed,
  CarFront,
  Package,
} from 'lucide-react';

/**
 * Door name resolver based on index.
 * Indices 0-3: passenger doors, 4: hood, 5: trunk
 */
function getDoorLabel(index, translation) {
  const labels = {
    0: `${translation?.door_prefix || 'Door'} 1 (FL)`,
    1: `${translation?.door_prefix || 'Door'} 2 (FR)`,
    2: `${translation?.door_prefix || 'Door'} 3 (RL)`,
    3: `${translation?.door_prefix || 'Door'} 4 (RR)`,
    4: translation?.door_hood || 'Hood',
    5: translation?.door_trunk || 'Trunk',
  };
  return labels[index] || `${translation?.door_prefix || 'Door'} ${index + 1}`;
}

/**
 * Get icon for door based on index.
 */
function getDoorIcon(index) {
  if (index === 4) return <CarFront className="h-4 w-4" />;
  if (index === 5) return <Package className="h-4 w-4" />;
  return <DoorClosed className="h-4 w-4" />;
}

/**
 * DoorsPanel — controls for each vehicle door, hood, and trunk.
 *
 * @param {object} props
 * @param {number} props.doorCount - Number of passenger doors
 * @param {number[]} props.openDoors - Array of open door indices
 * @param {boolean} props.hasHood - Whether the vehicle has a hood
 * @param {boolean} props.hasTrunk - Whether the vehicle has a trunk
 * @param {object} props.translation - Translation strings
 * @param {function} props.onToggleDoor - Callback to toggle a door (doorIndex)
 */
export default function DoorsPanel({
  doorCount = 0,
  openDoors = [],
  hasHood = true,
  hasTrunk = true,
  translation = {},
  onToggleDoor,
}) {
  const openSet = new Set(openDoors);

  // Build door list: passenger doors + hood + trunk
  const doors = [];
  for (let i = 0; i < doorCount; i++) {
    doors.push(i);
  }
  // Always show hood/trunk if the vehicle has them
  if (hasHood) doors.push(4);
  if (hasTrunk) doors.push(5);

  if (doors.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No doors available on this vehicle.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 animate-slide-in">
      {doors.map((doorIndex) => {
        const isOpen = openSet.has(doorIndex);
        return (
          <Button
            key={doorIndex}
            variant={isOpen ? 'default' : 'secondary'}
            className={`flex items-center justify-between gap-2 h-12 transition-all duration-200 ${
              isOpen
                ? 'bg-primary/90 hover:bg-primary shadow-md shadow-primary/20'
                : 'hover:bg-secondary/80'
            }`}
            onClick={() => onToggleDoor(doorIndex)}
          >
            <span className="flex items-center gap-2">
              {isOpen ? (
                <DoorOpen className="h-4 w-4" />
              ) : (
                getDoorIcon(doorIndex)
              )}
              <span className="text-xs font-medium">
                {getDoorLabel(doorIndex, translation)}
              </span>
            </span>
            <Badge
              variant={isOpen ? 'warning' : 'success'}
              className="text-[10px] px-1.5 py-0"
            >
              {isOpen
                ? translation?.open || 'Open'
                : translation?.closed || 'Closed'}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
}
