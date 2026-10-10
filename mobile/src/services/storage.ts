import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@lps_demo_state';

export type DemoState = {
  user: any | null;
  tickets: any[];
};

const initial: DemoState = {
  user: null,
  tickets: [
    {
      id: 'T-1001',
      propertyId: 'P-1',
      title: 'Leaking kitchen tap',
      description: 'The kitchen tap is leaking from the base.',
      priority: 'Medium',
      status: 'open',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'T-1002',
      propertyId: 'P-1',
      title: 'Boiler pressure issue',
      description: 'Boiler pressure drops every two days.',
      priority: 'High',
      status: 'quoted',
      createdAt: new Date().toISOString(),
      quote: 85,
      invoiceNote: 'Call-out and repair estimate.',
    },
  ],
};

export async function loadState(): Promise<DemoState> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return initial;
  try {
    return JSON.parse(raw);
  } catch {
    return initial;
  }
}

export async function saveState(state: DemoState) {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}

export async function clearState() {
  await AsyncStorage.removeItem(KEY);
}