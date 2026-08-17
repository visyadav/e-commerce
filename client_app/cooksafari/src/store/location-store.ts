import { create } from 'zustand';
import * as Location from 'expo-location';
import { locationService } from '@/services/api/location-service';
import { addressService } from '@/services/api/address-service';
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

export const HUB_LAT = 28.6280;
export const HUB_LNG = 77.3649;

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
  fetchSavedUserAddresses: () => Promise<LocationItem[]>;
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
    try {
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
        isServiceable: apiData ? apiData.isServiceable : false,
        distanceInKm: apiData && apiData.distanceInKm !== undefined ? apiData.distanceInKm : location.distanceInKm,
        message: apiData ? apiData.message : `[Debug API Warning] ${response.message || 'Service status check failed'}`,
      };

      set({ currentLocation: updatedLoc, isPickerModalOpen: false });
    } catch (err: any) {
      set({
        currentLocation: {
          ...location,
          isServiceable: false,
          message: `[Debug Network Warning] Could not connect to API: ${err?.message || 'Network Error'}`,
        },
        isPickerModalOpen: false,
      });
    }
  },

  openPickerModal: () => {
    set({ isPickerModalOpen: true });
    get().fetchActiveHubs();
    get().fetchSavedUserAddresses();
  },
  closePickerModal: () => set({ isPickerModalOpen: false }),

  fetchActiveHubs: async () => {
    try {
      const response = await locationService.getClientAreas();
      if (response.success && response.data) {
        const hubs = response.data;
        set({ activeHubs: hubs });
        return hubs;
      }
    } catch (err) {
      console.warn('Error fetching active hubs from API:', err);
    }
    return [];
  },

  fetchSavedUserAddresses: async () => {
    try {
      const response = await addressService.getAddresses();
      if (response.success && response.data) {
        const addresses = response.data;
        const mappedItems: LocationItem[] = addresses.map((a) => ({
          id: `saved-${a.id}`,
          title: `${a.label} (${a.houseNo || a.street.split(',')[0]})`,
          address: `${a.houseNo ? a.houseNo + ', ' : ''}${a.street}, ${a.city}`,
          pincode: a.zipCode,
          latitude: a.latitude || HUB_LAT,
          longitude: a.longitude || HUB_LNG,
          isServiceable: true,
          distanceInKm: 0.0,
          source: 'manual',
        }));

        set({ savedLocations: mappedItems });
        return mappedItems;
      }
    } catch (err) {
      console.warn('Error fetching user addresses:', err);
    }
    return [];
  },

  detectLocationFromGps: async () => {
    set({ isInitializingLocation: true });

    // Fetch active hubs and saved addresses
    await get().fetchActiveHubs();
    await get().fetchSavedUserAddresses();

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
          isInitializingLocation: false,
        }));

        return gpsLocation;
      }
    } catch (err) {
      console.warn('Location detection warning:', err);
    }

    // Fallback if permission denied or error: use first saved address or hub
    const saved = get().savedLocations;
    if (saved.length > 0) {
      set({ currentLocation: saved[0], isInitializingLocation: false });
      return saved[0];
    }

    set({ isInitializingLocation: false });
    return get().currentLocation;
  },

  checkCustomLocation: async (address: string, pincode: string, lat = HUB_LAT, lng = HUB_LNG) => {
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
