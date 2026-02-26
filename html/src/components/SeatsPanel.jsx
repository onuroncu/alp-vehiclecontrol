import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, UserCheck } from 'lucide-react';

/**
 * Get a descriptive label for a seat index.
 * Seat -1 = driver (FiveM uses -1 based), but we pass 1-based to NUI.
 */
function getSeatLabel(seatIndex, totalSeats, translation) {
  if (seatIndex === 0) return translation?.seat_driver || 'Driver';
  if (seatIndex === 1) return translation?.seat_passenger || 'Front Passenger';
  if (totalSeats <= 4) {
    return `${translation?.seat_rear || 'Rear'} ${seatIndex === 2 ? 'Left' : 'Right'}`;
  }
  return `${translation?.seat_passenger || 'Passenger'} ${seatIndex}`;
}

/**
 * SeatsPanel — shows available seats and lets the player switch.
 * The seat indices shown here are 1-based (0 = Driver → maps to FiveM seat -1).
 *
 * @param {object} props
 * @param {number} props.seatCount - Total number of seats
 * @param {number} props.currentSeat - Current seat index (FiveM: -1 based, converted to 0-based for display)
 * @param {object} props.translation - Translation strings
 * @param {function} props.onSwitchSeat - Callback (seatIndex: 1-based for NUI → converted in Lua)
 */
export default function SeatsPanel({
  seatCount = 0,
  currentSeat = -1,
  translation = {},
  onSwitchSeat,
}) {
  // Convert FiveM seat index (-1 = driver, 0 = passenger...) to 0-based display index
  const currentDisplaySeat = currentSeat + 1;

  const seats = [];
  for (let i = 0; i < seatCount; i++) {
    seats.push(i);
  }

  if (seats.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No seat data available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 animate-slide-in">
      {seats.map((seatDisplayIndex) => {
        const isCurrent = seatDisplayIndex === currentDisplaySeat;
        // Convert to 1-based index for the Lua callback (Lua will subtract 1 for FiveM seat index)
        const nuiSeatIndex = seatDisplayIndex;

        return (
          <Button
            key={seatDisplayIndex}
            variant={isCurrent ? 'default' : 'secondary'}
            className={`flex items-center justify-between gap-2 h-12 transition-all duration-200 ${
              isCurrent
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 cursor-default'
                : 'hover:bg-secondary/80'
            }`}
            onClick={() => {
              if (!isCurrent) onSwitchSeat(nuiSeatIndex);
            }}
            disabled={isCurrent}
          >
            <span className="flex items-center gap-2">
              {isCurrent ? (
                <UserCheck className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
              <span className="text-xs font-medium">
                {getSeatLabel(seatDisplayIndex, seatCount, translation)}
              </span>
            </span>
            {isCurrent && (
              <Badge variant="success" className="text-[10px] px-1.5 py-0">
                You
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
}
