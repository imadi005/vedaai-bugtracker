import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './store';

let socket: Socket | null = null;

export const getSocket = (): Socket | null => socket;

export const useSocket = () => {
  const { token } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
        auth: { token },
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });
    }

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      // Don't disconnect on component unmount, keep single connection
    };
  }, [token]);

  return socketRef.current;
};
