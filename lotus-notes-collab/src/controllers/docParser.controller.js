const mammoth = require('mammoth');
const path = require('path');
const fs = require('fs');

/**
 * Extrae texto de un DOCX y parsea los campos del formato de informe de servicio social.
 * POST /api/supervisor/parse-report
 */
exports.parseReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se recibio ningun archivo' });
    }

    const filePath = req.file.path;
    let rawText = '';

    try {
      const result = await mammoth.extractRawText({ path: filePath });
      rawText = result.value || '';
    } finally {
      // Limpiar archivo temporal
      try { fs.unlinkSync(filePath); } catch {}
    }

    if (!rawText.trim()) {
      return res.status(422).json({ success: false, message: 'No se pudo extraer texto del documento' });
    }

    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const text = rawText;

    // ── Helpers ──────────────────────────────────────────────────────────────
    const extract = (pattern, flags = 'i') => {
      const m = text.match(new RegExp(pattern, flags));
      return m ? (m[1] || m[0]).trim() : '';
    };

    const extractAfterLabel = (label) => {
      const idx = lines.findIndex(l => l.toLowerCase().includes(label.toLowerCase()));
      if (idx === -1) return '';
      // Valor puede estar en la misma línea o en la siguiente
      const same = lines[idx].replace(new RegExp(label, 'i'), '').replace(/[:]/g, '').trim();
      if (same) return same;
      return lines[idx + 1] || '';
    };

    // ── Parseo de fechas ──────────────────────────────────────────────────────
    const parseDateMX = (str) => {
      if (!str) return '';
      // dd/mm/yyyy
      const m = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
      if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
      return '';
    };

    // ── Extraer campos ────────────────────────────────────────────────────────
    const lugar = extractAfterLabel('Lugar');
    const fecha = extractAfterLabel('Fecha');

    // Datos del brigadista
    const unidadAcademica = extractAfterLabel('Unidad Académica') || extractAfterLabel('Unidad Academica');
    const licenciatura = extractAfterLabel('Licenciatura');
    const numeroCuenta = extractAfterLabel('Número de Cuenta') || extractAfterLabel('Numero de Cuenta');
    const nombreBrigadista = extractAfterLabel('Nombre del Brigadista');

    // Datos de la unidad receptora
    const unidadReceptora = extractAfterLabel('Nombre de la Unidad Receptora');
    const proyecto = extractAfterLabel('Nombre del proyecto') || extractAfterLabel('Nombre del Proyecto');
    const modalidad = extractAfterLabel('Modalidad');

    // Periodo
    const periodoMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\s+al\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i);
    const periodStart = periodoMatch ? parseDateMX(periodoMatch[1]) : '';
    const periodEnd   = periodoMatch ? parseDateMX(periodoMatch[2]) : '';

    // Número de informe y horas
    const numInforme = extract('(?:Número|Numero) de Informe[:\\s]+([\\d]+)') ||
                       extract('Informe[:\\s#]+([\\d]+)');
    const horas = extract('Horas reportadas[:\\s#]+([\\d]+)') ||
                  extract('([\\d]+)\\s*horas', 'i');

    // Secciones de texto libre
    const extractSection = (startLabel, endLabel) => {
      const startIdx = lines.findIndex(l => l.toLowerCase().includes(startLabel.toLowerCase()));
      if (startIdx === -1) return '';
      const endIdx = endLabel
        ? lines.findIndex((l, i) => i > startIdx && l.toLowerCase().includes(endLabel.toLowerCase()))
        : lines.length;
      return lines.slice(startIdx + 1, endIdx === -1 ? undefined : endIdx).join('\n').trim();
    };

    const resultados = extractSection('Resultados obtenidos', 'Participantes');
    const observaciones = extractSection('Observaciones', 'Evidencias');
    const evidencias = extractSection('Evidencias de trabajo', null);

    // Objetivos (tabla simple)
    const objetivosSection = extractSection('Objetivo, metas y actividades', 'Resultados');
    const objetivos = objetivosSection
      ? [{ objective: objetivosSection.slice(0, 200), goals: '', activities: '' }]
      : [];

    // Participantes
    const participantesSection = extractSection('Participantes', 'Observaciones');
    const participantes = participantesSection
      ? [{ activity: participantesSection.slice(0, 200), count: 0 }]
      : [];

    // Construir título del reporte
    const title = [
      proyecto || 'Informe de Servicio Social',
      numInforme ? `No. ${numInforme}` : '',
      periodEnd ? periodEnd.slice(0, 7) : ''
    ].filter(Boolean).join(' — ');

    // Descripción combinada
    const description = [
      unidadReceptora ? `Unidad Receptora: ${unidadReceptora}` : '',
      modalidad ? `Modalidad: ${modalidad}` : '',
      resultados ? `\nResultados:\n${resultados}` : ''
    ].filter(Boolean).join('\n');

    res.json({
      success: true,
      data: {
        // Para el formulario de asignación
        title,
        description,
        periodStart,
        periodEnd,
        // Datos adicionales del informe
        lugar,
        fecha: parseDateMX(fecha),
        unidadAcademica,
        licenciatura,
        numeroCuenta,
        nombreBrigadista,
        unidadReceptora,
        proyecto,
        modalidad,
        numInforme,
        horas: horas ? parseInt(horas) : 0,
        resultados,
        observaciones,
        evidencias,
        objetivos,
        participantes,
        // Texto completo por si se necesita
        rawText: rawText.slice(0, 2000)
      }
    });
  } catch (error) {
    console.error('[DocParser] Error:', error);
    res.status(500).json({ success: false, message: 'Error al procesar el documento', error: error.message });
  }
};
