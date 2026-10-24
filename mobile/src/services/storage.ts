//1111111 import AsyncStorage from '@react-native-async-storage/async-storage';

// const KEY = '@lps_demo_state';

// export type DemoState = {
//   user: any | null;
//   tickets: any[];
// };

// const initial: DemoState = {
//   user: null,
//   tickets: [
//     {
//       id: 'T-1001',
//       propertyId: 'P-1',
//       title: 'Leaking kitchen tap',
//       description: 'The kitchen tap is leaking from the base.',
//       priority: 'Medium',
//       status: 'open',
//       createdAt: new Date().toISOString(),
//     },
//     {
//       id: 'T-1002',
//       propertyId: 'P-1',
//       title: 'Boiler pressure issue',
//       description: 'Boiler pressure drops every two days.',
//       priority: 'High',
//       status: 'quoted',
//       createdAt: new Date().toISOString(),
//       quote: 85,
//       invoiceNote: 'Call-out and repair estimate.',
//     },
//   ],
// };

// export async function loadState(): Promise<DemoState> {
//   const raw = await AsyncStorage.getItem(KEY);
//   if (!raw) return initial;
//   try {
//     return JSON.parse(raw);
//   } catch {
//     return initial;
//   }
// }

// export async function saveState(state: DemoState) {
//   await AsyncStorage.setItem(KEY, JSON.stringify(state));
// }

// export async function clearState() {
//   await AsyncStorage.removeItem(KEY);
// }







// //222222222 Define your API base URL (Change this to your actual production or staging endpoint)
// const API_BASE_URL = 'https://lps-production-319e.up.railway.app';

// export type DemoState = {
//   user: any | null;
//   tickets: any[];
// };

// // Fallback initial state in case the API call completely fails
// const initial: DemoState = {
//   user: null,
//   tickets: [],
// };

// /**
//  * Fetches the live application state from the backend database.
//  */
// export async function loadState(): Promise<DemoState> {
//   try {
//     const response = await fetch(`${API_BASE_URL}/state`, {
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//         // 'Authorization': `Bearer ${token}` // Add auth tokens if needed
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`Server returned status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Failed to load real-world state from API:', error);
//     // Fall back to initial empty arrays so the UI doesn't crash
//     return initial; 
//   }
// }

// /**
//  * Persists the entire state back to the remote server database.
//  */
// export async function saveState(state: DemoState): Promise<void> {
//   try {
//     const response = await fetch(`${API_BASE_URL}/state`, {
//       method: 'PUT', // Using PUT assuming this updates a complete record
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(state),
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to save state. Server responded with: ${response.status}`);
//     }
//   } catch (error) {
//     console.error('Failed to sync state to server:', error);
//     throw error; // Re-throw if you want your UI components to show an error banner
//   }
// }

// /**
//  * Resets or clears user data from the session database.
//  */
// export async function clearState(): Promise<void> {
//   try {
//     const response = await fetch(`${API_BASE_URL}/state`, {
//       method: 'DELETE',
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to clear server state: ${response.status}`);
//     }
//   } catch (error) {
//     console.error('Failed to execute clearState on API:', error);
//     throw error;
//   }
// }


// 3333333 import { API_URL } from '../config/api';

// export type DemoState = {
//   user: any | null;
//   tickets: any[];
// };

// const initial: DemoState = {
//   user: null,
//   tickets: [],
// };

// export async function loadState(): Promise<DemoState> {
//   try {
//     const response = await fetch(`${API_URL}/state`);
//     if (!response.ok) throw new Error('Network error');
//     return await response.json();
//   } catch (error) {
//     console.error('Failed to load real data:', error);
//     return initial;
//   }
// }

// export async function saveState(state: DemoState): Promise<void> {
//   try {
//     await fetch(`${API_URL}/state`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(state),
//     });
//   } catch (error) {
//     console.error('Failed to save data to server:', error);
//   }
// }

// export async function clearState(): Promise<void> {
//   try {
//     await fetch(`${API_URL}/state`, { method: 'DELETE' });
//   } catch (error) {
//     console.error('Failed to clear server state:', error);
//   }
// }



// Legacy demo-state storage was removed.
// The app now uses src/services/api.ts to read/write data through the authenticated LPS API.
