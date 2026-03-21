/**
 * Constantes unificadas de estados de reportes.
 * Usar siempre estas constantes en lugar de strings literales.
 */
const REPORT_STATUS = {
  // Flujo Supervisor-Brigadista
  ASIGNADO:       'ASIGNADO',
  EN_ELABORACION: 'EN_ELABORACION',
  ENVIADO:        'ENVIADO',
  EN_REVISION:    'EN_REVISION',
  OBSERVADO:      'OBSERVADO',
  APROBADO:       'APROBADO',

  // Flujo Estudiante (legacy)
  DRAFT:     'draft',
  SUBMITTED: 'submitted',
  APPROVED:  'approved',
  REJECTED:  'rejected',
};

/** Estados que permiten edición por el brigadista/estudiante */
const EDITABLE_STATUSES = [
  REPORT_STATUS.DRAFT,
  REPORT_STATUS.ASIGNADO,
  REPORT_STATUS.EN_ELABORACION,
  REPORT_STATUS.OBSERVADO,
];

/** Estados que permiten eliminación */
const DELETABLE_STATUSES = [
  REPORT_STATUS.DRAFT,
  REPORT_STATUS.ASIGNADO,
];

module.exports = { REPORT_STATUS, EDITABLE_STATUSES, DELETABLE_STATUSES };
