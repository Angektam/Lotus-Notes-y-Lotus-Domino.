import { useState, useEffect } from 'react';
import axios from '../api/axios';
import './Reports.css';

function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [formData, setFormData] = useState({
    studentName: '',
    academicUnit: '',
    career: '',
    accountNumber: '',
    dependencyName: '',
    projectName: '',
    startDate: '',
    endDate: '',
    totalHours: 0,
    objectives: [{ objective: '', goals: '', activities: '' }],
    participants: [{ activity: '', count: 0 }],
    observations: '',
    reportMonth: new Date().toLocaleString('es', { month: 'long' }),
    reportYear: new Date().getFullYear()
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/reports');
      setReports(response.data.data || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        setError('No se pudieron cargar los informes. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleObjectiveChange = (index, field, value) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index][field] = value;
    setFormData(prev => ({ ...prev, objectives: newObjectives }));
  };

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, { objective: '', goals: '', activities: '' }]
    }));
  };

  const removeObjective = (index) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const handleParticipantChange = (index, field, value) => {
    const newParticipants = [...formData.participants];
    newParticipants[index][field] = value;
    setFormData(prev => ({ ...prev, participants: newParticipants }));
  };

  const addParticipant = () => {
    setFormData(prev => ({
      ...prev,
      participants: [...prev.participants, { activity: '', count: 0 }]
    }));
  };

  const removeParticipant = (index) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.studentName.trim()) { setFormError('El nombre del estudiante es obligatorio'); return; }
    if (!formData.academicUnit.trim()) { setFormError('La unidad académica es obligatoria'); return; }
    if (!formData.career.trim()) { setFormError('La carrera es obligatoria'); return; }
    if (!formData.accountNumber.trim()) { setFormError('El número de cuenta es obligatorio'); return; }
    if (!formData.dependencyName.trim()) { setFormError('El nombre de la dependencia es obligatorio'); return; }
    if (!formData.projectName.trim()) { setFormError('El nombre del proyecto es obligatorio'); return; }
    if (!formData.startDate) { setFormError('La fecha de inicio es obligatoria'); return; }
    if (!formData.endDate) { setFormError('La fecha de fin es obligatoria'); return; }
    if (Number(formData.totalHours) < 0) { setFormError('Las horas no pueden ser negativas'); return; }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setFormError('La fecha de fin no puede ser anterior a la fecha de inicio'); return;
    }
    if (!formData.reportMonth.trim()) { setFormError('El mes del informe es obligatorio'); return; }
    if (!formData.reportYear || formData.reportYear < 2000) { setFormError('El año del informe es inválido'); return; }
    if (formData.objectives.some(o => !o.objective.trim())) { setFormError('Todos los objetivos deben tener descripción'); return; }
    if (formData.participants.some(p => !p.activity.trim())) { setFormError('Todas las actividades de participantes deben tener descripción'); return; }

    setSubmitting(true);
    try {
      if (editingReport) {
        await axios.put(`/reports/${editingReport.id}`, formData);
        setSuccessMsg('Informe actualizado exitosamente');
      } else {
        await axios.post('/reports', formData);
        setSuccessMsg('Informe creado exitosamente');
      }
      setTimeout(() => setSuccessMsg(''), 4000);
      setShowForm(false);
      setEditingReport(null);
      resetForm();
      fetchReports();
    } catch (err) {
      setFormError(err.response?.data?.message || err.response?.data?.error || 'Error al guardar el informe');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report);
    setFormData({
      studentName: report.studentName,
      academicUnit: report.academicUnit,
      career: report.career,
      accountNumber: report.accountNumber,
      dependencyName: report.dependencyName,
      projectName: report.projectName,
      startDate: report.startDate.split('T')[0],
      endDate: report.endDate.split('T')[0],
      totalHours: report.totalHours,
      objectives: report.objectives.length > 0 ? report.objectives : [{ objective: '', goals: '', activities: '' }],
      participants: report.participants.length > 0 ? report.participants : [{ activity: '', count: 0 }],
      observations: report.observations || '',
      reportMonth: report.reportMonth,
      reportYear: report.reportYear
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este informe?')) return;
    try {
      await axios.delete(`/reports/${id}`);
      setSuccessMsg('Informe eliminado exitosamente');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error al eliminar el informe');
    }
  };

  const resetForm = () => {
    setFormData({
      studentName: '',
      academicUnit: '',
      career: '',
      accountNumber: '',
      dependencyName: '',
      projectName: '',
      startDate: '',
      endDate: '',
      totalHours: 0,
      objectives: [{ objective: '', goals: '', activities: '' }],
      participants: [{ activity: '', count: 0 }],
      observations: '',
      reportMonth: new Date().toLocaleString('es', { month: 'long' }),
      reportYear: new Date().getFullYear()
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { text: 'Borrador', class: 'badge-draft' },
      submitted: { text: 'Enviado', class: 'badge-submitted' },
      approved: { text: 'Aprobado', class: 'badge-approved' },
      rejected: { text: 'Rechazado', class: 'badge-rejected' }
    };
    return badges[status] || badges.draft;
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>📋 Informes de Servicio Social</h1>
        <button 
          className="btn-new-report"
          onClick={() => {
            setShowForm(true);
            setEditingReport(null);
            resetForm();
            setFormError('');
          }}
        >
          + Nuevo Informe
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '16px' }}>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {successMsg && (
        <div className="success-message" style={{ marginBottom: '16px' }}>
          {successMsg}
        </div>
      )}

      {showForm && (
        <div className="report-form-modal">
          <div className="report-form-content">
            <div className="form-header">
              <h2>{editingReport ? 'Editar Informe' : 'Nuevo Informe Mensual'}</h2>
              <button className="btn-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            {formError && (
              <div className="error-message" style={{ margin: '0 0 16px' }}>{formError}</div>
            )}

            <form onSubmit={handleSubmit}>
              {/* I. Datos del Estudiante y Dependencia */}
              <section className="form-section">
                <h3>I. Datos del Estudiante y Dependencia</h3>
                <div className="form-grid">
                  <input
                    type="text"
                    name="studentName"
                    placeholder="Nombre completo del estudiante"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="text"
                    name="academicUnit"
                    placeholder="Unidad Académica"
                    value={formData.academicUnit}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="text"
                    name="career"
                    placeholder="Carrera"
                    value={formData.career}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="text"
                    name="accountNumber"
                    placeholder="Número de cuenta"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="text"
                    name="dependencyName"
                    placeholder="Nombre de la dependencia"
                    value={formData.dependencyName}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="text"
                    name="projectName"
                    placeholder="Nombre del proyecto"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="number"
                    name="totalHours"
                    placeholder="Total de horas"
                    value={formData.totalHours}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </section>

              {/* II. Objetivos, Metas y Actividades */}
              <section className="form-section">
                <h3>II. Objetivos, Metas y Actividades</h3>
                {formData.objectives.map((obj, index) => (
                  <div key={index} className="objective-row">
                    <input
                      type="text"
                      placeholder="Objetivo específico"
                      value={obj.objective}
                      onChange={(e) => handleObjectiveChange(index, 'objective', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Metas"
                      value={obj.goals}
                      onChange={(e) => handleObjectiveChange(index, 'goals', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Actividades"
                      value={obj.activities}
                      onChange={(e) => handleObjectiveChange(index, 'activities', e.target.value)}
                      required
                    />
                    {formData.objectives.length > 1 && (
                      <button type="button" className="btn-remove" onClick={() => removeObjective(index)}>
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-add" onClick={addObjective}>
                  + Agregar Objetivo
                </button>
              </section>

              {/* III. Participantes y Beneficiados */}
              <section className="form-section">
                <h3>III. Participantes y/o Beneficiados</h3>
                {formData.participants.map((part, index) => (
                  <div key={index} className="participant-row">
                    <input
                      type="text"
                      placeholder="Actividad"
                      value={part.activity}
                      onChange={(e) => handleParticipantChange(index, 'activity', e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="No. de participantes"
                      value={part.count}
                      onChange={(e) => handleParticipantChange(index, 'count', parseInt(e.target.value))}
                      required
                    />
                    {formData.participants.length > 1 && (
                      <button type="button" className="btn-remove" onClick={() => removeParticipant(index)}>
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-add" onClick={addParticipant}>
                  + Agregar Participante
                </button>
              </section>

              {/* IV. Observaciones */}
              <section className="form-section">
                <h3>IV. Observaciones</h3>
                <textarea
                  name="observations"
                  placeholder="Resultados obtenidos, dificultades, aprendizajes..."
                  value={formData.observations}
                  onChange={handleInputChange}
                  rows="5"
                />
              </section>

              <section className="form-section">
                <h3>V. Período del informe</h3>
                <div className="form-grid">
                  <select name="reportMonth" value={formData.reportMonth} onChange={handleInputChange} required>
                    {['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'].map(m => (
                      <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    name="reportYear"
                    placeholder="Año"
                    value={formData.reportYear}
                    onChange={handleInputChange}
                    min="2000"
                    max="2100"
                    required
                  />
                </div>
              </section>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save" disabled={submitting}>
                  {submitting ? 'Guardando...' : (editingReport ? 'Actualizar' : 'Guardar')} Informe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="reports-list">
        {loading ? (
          <div className="empty-state">
            <p>Cargando informes...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="empty-state">
            <p>No hay informes registrados</p>
            <p>Crea tu primer informe mensual</p>
          </div>
        ) : (
          reports.map(report => (
            <div key={report.id} className="report-card">
              <div className="report-header-card">
                <h3>{report.reportMonth} {report.reportYear}</h3>
                <span className={`badge ${getStatusBadge(report.status).class}`}>
                  {getStatusBadge(report.status).text}
                </span>
              </div>
              <div className="report-info">
                <p><strong>Proyecto:</strong> {report.projectName}</p>
                <p><strong>Dependencia:</strong> {report.dependencyName}</p>
                <p><strong>Horas:</strong> {report.totalHours}</p>
              </div>
              <div className="report-actions">
                <button className="btn-edit" onClick={() => handleEdit(report)}>
                  ✏️ Editar
                </button>
                <button className="btn-delete" onClick={() => handleDelete(report.id)}>
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Reports;
