import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import axios from '../api/axios';
import './NotificationBell.css';

const NotificationBell = () => {
  const { notifications: realtimeNotifications } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchNotifications();
      fetchUnreadCount();
    }
  }, []);

  useEffect(() => {
    // Agregar notificaciones en tiempo real
    if (realtimeNotifications.length > 0) {
      setNotifications(prev => [...realtimeNotifications, ...prev]);
      setUnreadCount(prev => prev + realtimeNotifications.length);
    }
  }, [realtimeNotifications]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await axios.get('/notifications');
      setNotifications(response.data.data || []);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Error al cargar notificaciones:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const response = await axios.get('/notifications/unread-count');
      setUnreadCount(response.data.data.unreadCount || 0);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Error al cargar contador:', error);
      }
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH': return '🔴';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🟢';
      default: return '🔵';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'REPORT_ASSIGNED': return '📋';
      case 'REPORT_SUBMITTED': return '📤';
      case 'REPORT_APPROVED': return '✅';
      case 'REPORT_REJECTED': return '❌';
      case 'REPORT_OVERDUE': return '⏰';
      case 'REMINDER': return '🔔';
      default: return '📨';
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return notifDate.toLocaleDateString('es-MX');
  };

  return (
    <div className="notification-bell">
      <button
        className="bell-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notificaciones</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-btn">
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">Cargando...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <p>No hay notificaciones</p>
              </div>
            ) : (
              notifications.slice(0, 10).map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {getTypeIcon(notification.type)}
                    {getPriorityIcon(notification.priority)}
                  </div>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  {!notification.read && <div className="unread-dot"></div>}
                </div>
              ))
            )}
          </div>

          {notifications.length > 10 && (
            <div className="dropdown-footer">
              <button onClick={() => navigate('/notifications')}>
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
