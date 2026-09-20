import { AuthService } from '../types';
import { mockUser } from '@/mocks/dhaka';
import { delay, uid } from './util';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'poth.session';

export const mockAuthService: AuthService = {
  async requestOtp(_phone: string) {
    return delay({ requestId: uid('otp') }, 700);
  },

  async verifyOtp(_requestId, code, name) {
    if (code.length < 4) {
      throw new Error('Enter the 4-digit code');
    }
    const user = { ...mockUser, name: name ?? mockUser.name };
    const token = uid('token');
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ user, token }));
    return delay({ user, token }, 900);
  },

  async signOut() {
    await AsyncStorage.removeItem(SESSION_KEY);
    return delay(undefined, 200);
  },

  async getCurrentUser() {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { user } = JSON.parse(raw);
    return delay(user, 300);
  },
};
