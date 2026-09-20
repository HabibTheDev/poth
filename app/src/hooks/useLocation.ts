import { useEffect, useRef, useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { LatLng } from '@/types/domain';
import { DHAKA_CENTER } from '@/mocks/dhaka';

export type LocationPermissionState = 'unknown' | 'granted' | 'denied';

interface UseLocationOptions {
  /** Higher accuracy + tighter interval while actively navigating; coarser otherwise. */
  active?: boolean;
}

export function useLocation({ active = false }: UseLocationOptions = {}) {
  const [permission, setPermission] = useState<LocationPermissionState>('unknown');
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [heading, setHeading] = useState<number | undefined>(undefined);
  const subRef = useRef<Location.LocationSubscription | null>(null);

  const requestPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermission(status === 'granted' ? 'granted' : 'denied');
    return status === 'granted';
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (cancelled) return;

      if (status !== 'granted') {
        setPermission('denied');
        // Fall back to a sensible demo center (Dhaka) so the map is never empty.
        setCoords(DHAKA_CENTER);
        return;
      }

      setPermission('granted');

      subRef.current = await Location.watchPositionAsync(
        {
          accuracy: active ? Location.Accuracy.BestForNavigation : Location.Accuracy.Balanced,
          timeInterval: active ? 1500 : 8000,
          distanceInterval: active ? 5 : 25,
        },
        (loc) => {
          setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          if (loc.coords.heading !== null && loc.coords.heading >= 0) {
            setHeading(loc.coords.heading);
          }
        }
      );
    }

    start();

    return () => {
      cancelled = true;
      subRef.current?.remove();
      subRef.current = null;
    };
  }, [active]);

  return { coords: coords ?? DHAKA_CENTER, heading, permission, requestPermission };
}
