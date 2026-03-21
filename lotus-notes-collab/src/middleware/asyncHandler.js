/**
 * Wrapper que elimina el boilerplate try/catch en controladores.
 * Cualquier error lanzado dentro del handler se pasa automáticamente
 * al middleware de errores global de Express.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
