import { useEffect, useState } from 'react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const Analytics = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role);
  }, []);

  return (
    <div style={{ padding: '30px' }}>
      <AnalyticsDashboard userRole={userRole} />
    </div>
  );
};

export default Analytics;
