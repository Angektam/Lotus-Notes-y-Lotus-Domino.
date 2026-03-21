import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket debe usarse dentro de SocketProvider');
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000', {
      autoConnect: false
    });

    newSocket.on('connect', () => {
      setConnected(true);
      // Autenticar con JWT en lugar de userId plano
      const token = localStorage.getItem('token');
      if (token) newSocket.emit('authenticate', token);
    });

    newSocket.on('authenticated', ({ success }) => {
      if (!success) console.warn('Socket: autenticación fallida');
    });

    newSocket.on('disconnect', () => setConnected(false));

    newSocket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, { body: notification.message });
      }
    });

    newSocket.on('reportUpdate', (report) => {
      window.dispatchEvent(new CustomEvent('reportUpdate', { detail: report }));
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  const connectSocket = () => {
    if (socket && !socket.connected && localStorage.getItem('token')) {
      socket.connect();
    }
  };

  const disconnectSocket = () => {
    if (socket?.connected) socket.disconnect();
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connected, notifications, connectSocket, disconnectSocket, requestNotificationPermission }}>
      {children}
    </SocketContext.Provider>
  );
};
