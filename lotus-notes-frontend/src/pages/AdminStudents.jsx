import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import './AdminStudents.css';

function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data.data || []);
    } catch (e) {
      console.error('Error al cargar estudiantes:', e);
      setError('No se pudieron cargar los estudiantes. Revisa tu sesión o el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const totalStudents = students.length;
    const totalHours = students.reduce((sum, s) => sum + (s.stats?.totalHours || 0), 0);
    const totalReports = students.reduce((sum, s) => sum + (s.stats?.totalReports || 0), 0);
    const pendingReports = students.reduce((sum, s) => sum + (s.stats?.pending || 0), 0);
    const approvedReports = students.reduce((sum, s) => sum + (s.stats?.approved || 0), 0);
    return { totalStudents, totalHours, totalReports, pendingReports, approvedReports };
  }, [students]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = !q
      ? students
      : students.filter((s) => {
      const haystack = [
        s.fullName,
        s.username,
        s.email,
        s.department
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    const getName = (s) => (s.fullName || s.username || '').toLowerCase();
    const sorted = [...base].sort((a, b) => {
      switch (sortBy) {
        case 'name_desc':
          return getName(b).localeCompare(getName(a), 'es');
        case 'hours_desc':
          return (b.stats?.totalHours || 0) - (a.stats?.totalHours || 0);
        case 'hours_asc':
          return (a.stats?.totalHours || 0) - (b.stats?.totalHours || 0);
        case 'pending_desc':
          return (b.stats?.pending || 0) - (a.stats?.pending || 0);
        case 'pending_asc':
          return (a.stats?.pending || 0) - (b.stats?.pending || 0);
        case 'name_asc':
        default:
          return getName(a).localeCompare(getName(b), 'es');
      }
    });

    return sorted;
  }, [students, search, sortBy]);

  useEffect(() => {
    if (!selectedStudentId) return;
    loadStudentDetail(selectedStudentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudentId]);

  const loadStudentDetail = async (studentId) => {
    try {
      setDetailLoading(true);
      setDetailError('');
      setStudentDetail(null);
      const token = localStorage.getItem('token');
      const response = await api.get(`/admin/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudentDetail(response.data.data);
    } catch (e) {
      console.error('Error al cargar detalle del estudiante:', e);
      setDetailError('No se pudo cargar el detalle del estudiante.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedStudentId(null);
    setStudentDetail(null);
    setDetailError('');
    setDetailLoading(false);
  };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString('es-MX');
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando estudiantes...</p>
      </div>
    );
  }

  return (
    <div className="admin-students">
      <div className="page-header">
        <div>
          <h1>👥 Gestión de Estudiantes</h1>
          <p className="subtitle">Consulta estudiantes y su avance (informes/horas)</p>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card card">
          <div className="summary-icon">👤</div>
          <div className="summary-content">
            <div className="summary-value">{summary.totalStudents}</div>
            <div className="summary-label">Estudiantes</div>
          </div>
        </div>
        <div className="summary-card card">
          <div className="summary-icon">🕒</div>
          <div className="summary-content">
            <div className="summary-value">{summary.totalHours}</div>
            <div className="summary-label">Horas acumuladas</div>
          </div>
        </div>
        <div className="summary-card card">
          <div className="summary-icon">📄</div>
          <div className="summary-content">
            <div className="summary-value">{summary.totalReports}</div>
            <div className="summary-label">Informes</div>
          </div>
        </div>
        <div className="summary-card card">
          <div className="summary-icon">⏳</div>
          <div className="summary-content">
            <div className="summary-value">{summary.pendingReports}</div>
            <div className="summary-label">Pendientes</div>
          </div>
        </div>
      </div>

      <div className="card controls-card">
        <div className="controls-row">
          <div className="control-group">
            <label>Buscar</label>
            <div className="input-with-icon">
              <span className="input-icon" aria-hidden="true">🔎</span>
              <input
                type="text"
                placeholder="Nombre, usuario, correo o departamento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="control-group control-group-sm">
            <label>Ordenar</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name_asc">Nombre (A → Z)</option>
              <option value="name_desc">Nombre (Z → A)</option>
              <option value="hours_desc">Horas (mayor → menor)</option>
              <option value="hours_asc">Horas (menor → mayor)</option>
              <option value="pending_desc">Pendientes (mayor → menor)</option>
              <option value="pending_asc">Pendientes (menor → mayor)</option>
            </select>
          </div>

          <button className="btn btn-outline" onClick={loadStudents}>
            ⟳ Recargar
          </button>
        </div>

        <div className="control-summary">
          Mostrando {filteredStudents.length} de {students.length} estudiantes
        </div>

        {error && (
          <div className="error-banner">
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="students-grid">
        {filteredStudents.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-illustration" aria-hidden="true">🧾</div>
            <h3>Sin resultados</h3>
            <p>No se encontraron estudiantes con ese criterio.</p>
            <button className="btn btn-outline" onClick={() => setSearch('')}>Limpiar búsqueda</button>
          </div>
        ) : (
          filteredStudents.map((s) => (
            <button
              type="button"
              key={s.id}
              className="student-card card"
              onClick={() => setSelectedStudentId(s.id)}
              aria-label={`Ver detalle de ${s.fullName || s.username || 'estudiante'}`}
            >
              <div className="student-card-header">
                <div className="student-info">
                  <div className="student-avatar">
                    {(s.fullName || s.username || 'U')?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3>{s.fullName || s.username}</h3>
                    <p className="student-meta">
                      {s.email || 'Sin correo'}
                      {s.department ? ` • ${s.department}` : ''}
                    </p>
                  </div>
                </div>
                <div className="student-badges">
                  {(s.stats?.pending || 0) > 0 && (
                    <span className="badge badge-warning">⏳ {s.stats?.pending ?? 0}</span>
                  )}
                  {(s.stats?.approved || 0) > 0 && (
                    <span className="badge badge-success">✓ {s.stats?.approved ?? 0}</span>
                  )}
                </div>
              </div>

              <div className="student-stats">
                <div className="stat-pill">
                  <span className="stat-label">Informes</span>
                  <span className="stat-value">{s.stats?.totalReports ?? 0}</span>
                </div>
                <div className="stat-pill">
                  <span className="stat-label">Horas</span>
                  <span className="stat-value">{s.stats?.totalHours ?? 0}</span>
                </div>
                <div className="stat-pill success">
                  <span className="stat-label">Aprobados</span>
                  <span className="stat-value">{s.stats?.approved ?? 0}</span>
                </div>
                <div className="stat-pill warning">
                  <span className="stat-label">Pendientes</span>
                  <span className="stat-value">{s.stats?.pending ?? 0}</span>
                </div>
              </div>
              <div className="student-footer">
                <span className="student-footer-text">Ver detalle →</span>
              </div>
            </button>
          ))
        )}
      </div>

      {selectedStudentId && (
        <div className="modal-overlay" onClick={closeModal} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Detalle del estudiante</h2>
                <p className="modal-subtitle">Informes y datos generales</p>
              </div>
              <button className="btn-close" onClick={closeModal} aria-label="Cerrar">✕</button>
            </div>

            <div className="modal-body">
              {detailLoading ? (
                <div className="modal-loading">
                  <div className="spinner"></div>
                  <p>Cargando detalle...</p>
                </div>
              ) : detailError ? (
                <div className="modal-error">
                  <p>{detailError}</p>
                  <button className="btn btn-outline" onClick={() => loadStudentDetail(selectedStudentId)}>
                    Reintentar
                  </button>
                </div>
              ) : studentDetail ? (
                <div className="detail-grid">
                  <div className="detail-card">
                    <div className="detail-title">Perfil</div>
                    <div className="detail-row">
                      <span className="detail-label">Nombre</span>
                      <span className="detail-value">{studentDetail.fullName || studentDetail.username}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Usuario</span>
                      <span className="detail-value">{studentDetail.username}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Correo</span>
                      <span className="detail-value">{studentDetail.email || '—'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Departamento</span>
                      <span className="detail-value">{studentDetail.department || '—'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Registro</span>
                      <span className="detail-value">{formatDate(studentDetail.createdAt) || '—'}</span>
                    </div>
                  </div>

                  <div className="detail-card">
                    <div className="detail-title">Informes</div>
                    <div className="reports-mini">
                      {(studentDetail.reports || []).length === 0 ? (
                        <div className="empty-mini">
                          <p>Este estudiante aún no tiene informes.</p>
                        </div>
                      ) : (
                        <div className="reports-table">
                          <table>
                            <thead>
                              <tr>
                                <th>Periodo</th>
                                <th>Horas</th>
                                <th>Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...studentDetail.reports]
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .slice(0, 10)
                                .map((r) => (
                                  <tr key={r.id}>
                                    <td>{r.reportMonth} {r.reportYear}</td>
                                    <td>{r.totalHours || 0}h</td>
                                    <td>
                                      <span
                                        className={
                                          `badge ${
                                            r.status === 'approved'
                                              ? 'badge-success'
                                              : r.status === 'submitted'
                                                ? 'badge-warning'
                                                : r.status === 'rejected'
                                                  ? 'badge-danger'
                                                  : 'badge-secondary'
                                          }`
                                        }
                                      >
                                        {r.status === 'approved'
                                          ? 'Aprobado'
                                          : r.status === 'submitted'
                                            ? 'Pendiente'
                                            : r.status === 'rejected'
                                              ? 'Rechazado'
                                              : 'Borrador'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                          {(studentDetail.reports || []).length > 10 && (
                            <div className="table-note">
                              Mostrando 10 de {(studentDetail.reports || []).length} informes.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStudents;

