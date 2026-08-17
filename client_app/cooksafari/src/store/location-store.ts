import { create } from 'zustand';
import * as Location from 'expo-location';
import { locationService } from '@/services/api/location-service';
import { ServiceableAreaDto } from '@/types/api';

export interface LocationItem {
  id: string;
  title: string;
  address: string;
  pincode: string;
  latitude: number;
  longitude: number;
  isServiceable: boolean;
  distanceInKm: number;
  source?: 'gps' | 'hub' | 'manual';
  message?: string;
}

interface LocationState {
  currentLocation: LocationItem | null;
  activeHubs: ServiceableAreaDto[];
  savedLocations: LocationItem[];
  isPickerModalOpen: boolean;
  isInitializingLocation: boolean;
  permissionStatus: string | null;

  setLocation: (location: LocationItem) => Promise<void>;
  openPickerModal: () => void;
  closePickerModal: () => void;
  fetchActiveHubs: () => Promise<ServiceableAreaDto[]>;
  detectLocationFromGps: () => Promise<LocationItem | null>;
  checkCustomLocation: (address: string, pincode: string, lat?: number, lng?: number) => Promise<LocationItem>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  currentLocation: null,
  activeHubs: [],
  savedLocations: [],
  isPickerModalOpen: false,
  isInitializingLocation: false,
  permissionStatus: null,

  setLocation: async (location: LocationItem) => {
    // Re-verify against backend Web API whenever location changes
    const response = await locationService.checkServiceability({
      latitude: location.latitude,
      longitude: location.longitude,
      sectorOrAddress: location.address,
      pincode: location.pincode,
    });

    const apiData = response.success ? response.data : null;

    const updatedLoc: LocationItem = {
      ...location,
      isServiceable: apiData ? apiData.isServiceable : location.isServiceable,
      distanceInKm: apiData && apiData.distanceInKm !== undefined ? apiData.distanceInKm : location.distanceInKm,
      message: apiData ? apiData.message : undefined,
    };

    set({ currentLocation: updatedLoc, isPickerModalOpen: false });
  },

  openPickerModal: () => {
    set({ isPickerModalOpen: true });
    get().fetchActiveHubs();
  },
  closePickerModal: () => set({ isPickerModalOpen: false }),

  fetchActiveHubs: async () => {
    try {
      const response = await locationService.getClientAreas();
      if (response.success && response.data) {
        const hubs = response.data;
        set({ activeHubs: hubs });

        // Map backend hubs to selectable location items
        const hubLocations: LocationItem[] = hubs.map(h => ({
          id: `hub-${h.id}`,
          title: h.name,
          address: `${h.name}, ${h.city}, ${h.state}`,
          pincode: h.pincode,
          latitude: h.latitude,
          longitude: h.longitude,
          isServiceable: h.isActive,
          distanceInKm: 0.0,
          source: 'hub',
        }));

        set(state => ({
          savedLocations: [
            ...hubLocations,
            ...state.savedLocations.filter(l => !l.id.startsWith('hub-')),
          ]
        }));

        return hubs;
      }
    } catch (err) {
      console.warn('Error fetching active hubs from API:', err);
    }
    return [];
  },

  detectLocationFromGps: async () => {
    set({ isInitializingLocation: true });

    // Fetch active hubs first
    await get().fetchActiveHubs();

    try {
      // 1. Request GPS foreground permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      set({ permissionStatus: status });

      if (status === 'granted') {
        // 2. Get current GPS coordinates
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const lat = location.coords.latitude;
        const lng = location.coords.longitude;

        // 3. Reverse Geocode address
        let formattedAddress = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        let title = 'Current GPS Location';
        let pincode = '';

        try {
          const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
          if (geocode && geocode.length > 0) {
            const g = geocode[0];
            const parts = [g.name, g.street, g.subregion || g.city, g.region].filter(Boolean);
            formattedAddress = parts.join(', ');
            title = g.subregion || g.city || g.name || 'Current Location';
            pincode = g.postalCode || '';
          }
        } catch {
          // Geocoding fallback
        }

        // 4. Call Web API to verify serviceability
        const response = await locationService.checkServiceability({
          latitude: lat,
          longitude: lng,
          sectorOrAddress: title,
          pincode,
        });

        let isServiceable = false;
        let distanceInKm = 0;
        let apiMessage: string | undefined;

        if (response.success && response.data) {
          isServiceable = response.data.isServiceable;
          distanceInKm = response.data.distanceInKm ?? 0;
          apiMessage = response.data.message;
        }

        const gpsLocation: LocationItem = {
          id: `gps-${Date.now()}`,
          title,
          address: formattedAddress,
          pincode,
          latitude: lat,
          longitude: lng,
          isServiceable,
          distanceInKm,
          message: apiMessage,
          source: 'gps',
        };

        set((state) => ({
          currentLocation: gpsLocation,
          savedLocations: [gpsLocation, ...state.savedLocations.filter(l => l.id !== gpsLocation.id)],
          isInitializingLocation: false,
        }));

        return gpsLocation;
      }
    } catch (err) {
      console.warn('Location detection warning:', err);
    }

    // Fallback if permission denied or error: use first active hub from API database if available
    const hubs = get().activeHubs;
    if (hubs.length > 0) {
      const defaultHub = hubs[0];
      const fallbackLoc: LocationItem = {
        id: `hub-${defaultHub.id}`,
        title: defaultHub.name,
        address: `${defaultHub.name}, ${defaultHub.city}`,
        pincode: defaultHub.pincode,
        latitude: defaultHub.latitude,
        longitude: defaultHub.longitude,
        isServiceable: defaultHub.isActive,
        distanceInKm: 0.0,
        source: 'hub',
      };
      set({ currentLocation: fallbackLoc, isInitializingLocation: false });
      return fallbackLoc;
    }

    set({ isInitializingLocation: false });
    return get().currentLocation;
  },

  checkCustomLocation: async (address: string, pincode: string, lat = 28.6280, lng = 77.3649) => {
    // Query Web API for serviceability
    const response = await locationService.checkServiceability({
      latitude: lat,
      longitude: lng,
      sectorOrAddress: address,
      pincode,
    });

    let isServiceable = false;
    let distanceInKm = 0;
    let apiMessage: string | undefined;

    if (response.success && response.data) {
      isServiceable = response.data.isServiceable;
      distanceInKm = response.data.distanceInKm ?? 0;
      apiMessage = response.data.message;
    }

    const newLoc: LocationItem = {
      id: `custom-${Date.now()}`,
      title: 'Custom Address',
      address,
      pincode,
      latitude: lat,
      longitude: lng,
      isServiceable,
      distanceInKm,
      message: apiMessage,
      source: 'manual',
    };

    set((state) => ({
      savedLocations: [newLoc, ...state.savedLocations],
      currentLocation: newLoc,
      isPickerModalOpen: false,
    }));

    return newLoc;
  },
}));
