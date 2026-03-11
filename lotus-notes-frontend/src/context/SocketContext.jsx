import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket debe usarse dentro de SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Conectar a Socket.io
    const newSocket = io('http://localhost:4000', {
      autoConnect: false
    });

    newSocket.on('connect', () => {
      console.log('✅ Conectado a Socket.io');
      setConnected(true);

      // Autenticar usuario
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) {
        newSocket.emit('authenticate', user.id);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Desconectado de Socket.io');
      setConnected(false);
    });

    // Escuchar notificaciones
    newSocket.on('notification', (notification) => {
      console.log('📨 Nueva notificación:', notification);
      setNotifications(prev => [notification, ...prev]);
      
      // Mostrar notificación del navegador
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png'
        });
      }
    });

    // Escuchar actualizaciones de reportes
    newSocket.on('reportUpdate', (report) => {
      console.log('📊 Actualización de reporte:', report);
      // Disparar evento personalizado para que otros componentes lo escuchen
      window.dispatchEvent(new CustomEvent('reportUpdate', { detail: report }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Conectar socket cuando el usuario hace login
  const connectSocket = () => {
    const token = localStorage.getItem('token');
    if (socket && !connected && token) {
      socket.connect();
    }
  };

  // Desconectar socket cuando el usuario hace logout
  const disconnectSocket = () => {
    if (socket && connected) {
      socket.disconnect();
    }
  };

  // Solicitar permisos de notificaciones
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        notifications,
        connectSocket,
        disconnectSocket,
        requestNotificationPermission
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
