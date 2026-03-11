import { useState } from 'react';
import axios from '../api/axios';
import './AdvancedSearch.css';

const AdvancedSearch = ({ onResults, userRole }) => {
  const [filters, setFilters] = useState({
    query: '',
    status: '',
    priority: '',
    startDate: '',
    endDate: '',
    assignedTo: '',
    page: 1,
    limit: 20
  });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    try {
      setLoading(true);
      const response = await axios.get('/api/analytics/search', { params: filters });
      onResults(response.data);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      alert('Error al realizar la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      query: '',
      status: '',
      priority: '',
      startDate: '',
      endDate: '',
      assignedTo: '',
      page: 1,
      limit: 20
    });
    onResults(null);
  };

  return (
    <div className="advanced-search">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-main">
          <input
            type="text"
            placeholder="🔍 Buscar por título o descripción..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="search-input"
          />
          <button type="submit" className="btn-search" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="btn-toggle-filters"
          >
            {showFilters ? '▲ Ocultar Filtros' : '▼ Más Filtros'}
          </button>
        </div>

        {showFilters && (
          <div className="search-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label>Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">Todos</option>
                  <option value="ASIGNADO">Asignado</option>
                  <option value="EN_ELABORACION">En Elaboración</option>
                  <option value="ENVIADO">Enviado</option>
                  <option value="EN_REVISION">En Revisión</option>
                  <option value="OBSERVADO">Observado</option>
                  <option value="APROBADO">Aprobado</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Prioridad</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                >
                  <option value="">Todas</option>
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Fecha Inicio</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>

              <div className="filter-group">
                <label>Fecha Fin</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="filter-actions">
              <button type="submit" className="btn-apply" disabled={loading}>
                Aplicar Filtros
              </button>
              <button type="button" onClick={handleReset} className="btn-reset">
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AdvancedSearch;
