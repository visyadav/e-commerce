import { create } from 'zustand';

export interface LocationItem {
  id: string;
  title: string; // e.g. "Home", "Office"
  address: string; // e.g. "Flat 402, Sector 62, Noida"
  pincode: string;
  latitude: number;
  longitude: number;
  isServiceable: boolean;
  distanceInKm?: number;
}

// Hub Center: Sector 62 Noida (Lat: 28.6280, Lng: 77.3649, Radius: 5.0 KM)
const HUB_LAT = 28.6280;
const HUB_LNG = 77.3649;
const MAX_RADIUS_KM = 5.0;

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const r = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return r * c;
}

export const PRESET_LOCATIONS: LocationItem[] = [
  {
    id: 'sec-62',
    title: 'Home (Sector 62)',
    address: 'Flat 402, Green Meadows, Sector 62, Noida',
    pincode: '201309',
    latitude: 28.6280,
    longitude: 77.3649,
    isServiceable: true,
    distanceInKm: 0.0,
  },
  {
    id: 'sec-79',
    title: 'Office (Sector 79)',
    address: 'Tower B, Tech Park, Sector 79, Noida',
    pincode: '201305',
    latitude: 28.5670,
    longitude: 77.3910,
    isServiceable: false,
    distanceInKm: 9.5,
  },
];

interface LocationState {
  currentLocation: LocationItem;
  savedLocations: LocationItem[];
  isPickerModalOpen: boolean;
  setLocation: (location: LocationItem) => void;
  openPickerModal: () => void;
  closePickerModal: () => void;
  checkCustomLocation: (address: string, pincode: string, lat?: number, lng?: number) => LocationItem;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  currentLocation: PRESET_LOCATIONS[0], // Default Sector 62 (Serviceable)
  savedLocations: PRESET_LOCATIONS,
  isPickerModalOpen: false,

  setLocation: (location: LocationItem) => {
    set({ currentLocation: location, isPickerModalOpen: false });
  },

  openPickerModal: () => set({ isPickerModalOpen: true }),
  closePickerModal: () => set({ isPickerModalOpen: false }),

  checkCustomLocation: (address: string, pincode: string, lat = 28.6280, lng = 77.3649) => {
    const dist = calculateDistance(lat, lng, HUB_LAT, HUB_LNG);
    const isServiceable = dist <= MAX_RADIUS_KM || address.toLowerCase().includes('62') || pincode === '201309';

    const newLoc: LocationItem = {
      id: `custom-${Date.now()}`,
      title: 'Custom Location',
      address,
      pincode,
      latitude: lat,
      longitude: lng,
      isServiceable,
      distanceInKm: Math.round(dist * 10) / 10,
    };

    set((state) => ({
      savedLocations: [newLoc, ...state.savedLocations],
      currentLocation: newLoc,
      isPickerModalOpen: false,
    }));

    return newLoc;
  },
}));
