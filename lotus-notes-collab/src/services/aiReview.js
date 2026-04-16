const Groq = require('groq-sdk');

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

/**
 * Analiza un reporte de brigadista y devuelve:
 * - resumen: texto breve del contenido
 * - recomendacion: 'APROBAR' | 'OBSERVAR'
 * - observaciones: lista de puntos a corregir (si aplica)
 * - puntuacion: 1-10
 * - comentario: texto listo para pegar en el campo de revisión
 */
async function analyzeReport(report) {
  if (!groq) {
    return {
      error: 'IA no configurada. Agrega GROQ_API_KEY en el archivo .env del backend.',
      resumen: null, recomendacion: null, observaciones: [], puntuacion: null, comentario: null
    };
  }

  const actividades = Array.isArray(report.activities) && report.activities.length > 0
    ? report.activities.map((a, i) =>
        `  ${i + 1}. Fecha: ${a.date || 'N/A'} | Lugar: ${a.location || 'N/A'} | Descripción: ${a.description || 'N/A'} | Hallazgos: ${a.findings || 'N/A'}`
      ).join('\n')
    : '  Sin actividades registradas';

  const prompt = `Eres un revisor experto de informes de servicio social universitario. Analiza el siguiente reporte de un brigadista y proporciona una evaluación estructurada en español.

REPORTE:
- Título: ${report.title || 'Sin título'}
- Brigadista: ${report.brigadistaInfo?.name || 'N/A'}
- Zona: ${report.brigadistaInfo?.zone || 'N/A'} | Equipo: ${report.brigadistaInfo?.team || 'N/A'}
- Período: ${report.periodStart ? new Date(report.periodStart).toLocaleDateString('es-MX') : 'N/A'} al ${report.periodEnd ? new Date(report.periodEnd).toLocaleDateString('es-MX') : 'N/A'}
- Fecha límite: ${report.dueDate ? new Date(report.dueDate).toLocaleDateString('es-MX') : 'N/A'}
- Descripción: ${report.description || 'Sin descripción'}
- Observaciones del brigadista: ${report.observations || 'Ninguna'}
- Versión del reporte: ${report.version || 1}

ACTIVIDADES REGISTRADAS:
${actividades}

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "resumen": "Resumen breve del reporte en 2-3 oraciones",
  "puntuacion": <número del 1 al 10>,
  "recomendacion": "<APROBAR o OBSERVAR>",
  "observaciones": ["observación 1", "observación 2"],
  "comentario": "Texto de retroalimentación profesional listo para enviar al brigadista"
}

Criterios de evaluación:
- APROBAR si: tiene actividades detalladas, descripción clara, hallazgos documentados, sin inconsistencias
- OBSERVAR si: actividades vagas, sin hallazgos, descripción insuficiente, fechas inconsistentes, o falta información clave`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw);

    return {
      resumen: parsed.resumen || 'No disponible',
      puntuacion: Math.min(10, Math.max(1, parseInt(parsed.puntuacion) || 5)),
      recomendacion: parsed.recomendacion === 'APROBAR' ? 'APROBAR' : 'OBSERVAR',
      observaciones: Array.isArray(parsed.observaciones) ? parsed.observaciones : [],
      comentario: parsed.comentario || '',
      error: null
    };
  } catch (err) {
    console.error('[IA] Error al analizar reporte:', err.message);
    return {
      error: `Error al contactar la IA: ${err.message}`,
      resumen: null, recomendacion: null, observaciones: [], puntuacion: null, comentario: null
    };
  }
}

module.exports = { analyzeReport };
