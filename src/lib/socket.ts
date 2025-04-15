import Pusher from 'pusher-js';
import { getToken } from './auth';

// Type definitions for Laravel Echo
interface BroadcastOptions {
  broadcaster: 'pusher';
  key: string | undefined;
  cluster: string | undefined;
  authEndpoint: string;
  auth: {
    headers: {
      Authorization: string;
    };
  };
  forceTLS: boolean;
}

interface Channel {
  listen(event: string, callback: Function): Channel;
  stopListening(event: string): Channel;
  error(callback: (error: any) => void): Channel;
  subscribed(callback: Function): Channel;
}

interface PrivateChannel extends Channel {
  whisper(eventName: string, data: any): PrivateChannel;
}

declare class Echo {
  constructor(options: BroadcastOptions);
  private(channel: string): PrivateChannel;
  join(channel: string): PrivateChannel;
  leave(channel: string): void;
  disconnect(): void;
}

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo;
  }
}

if (typeof window !== 'undefined') {
  window.Pusher = Pusher;
}

// Only enable console logging in development
Pusher.logToConsole = process.env.NODE_ENV === 'development';

const createEchoInstance = () => {
  const token = getToken();
  
  return new Echo({
    broadcaster: 'pusher',
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    authEndpoint: 'https://www.tselacoo.xyz/api/user/pusher/auth',
    auth: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    },
    forceTLS: true
  });
};

// Export a singleton instance
export const echo = typeof window !== 'undefined' ? createEchoInstance() : null;

// Utility function to reinitialize Echo (useful after login/token refresh)
export const reinitializeEcho = () => {
  if (typeof window !== 'undefined') {
    window.Echo = createEchoInstance();
    return window.Echo;
  }
  return null;
};