const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '../../uploads/images');
const META_FILE = path.join(UPLOAD_DIR, '_meta.json');

// Helpers de metadatos
function readMeta() {
  if (!fs.existsSync(META_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(META_FILE, 'utf8')); } catch { return {}; }
}

function saveMeta(meta) {
  fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
}

// Subir imagen
exports.uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se recibió ninguna imagen' });
    }

    const url = `/uploads/images/${req.file.filename}`;

    // Guardar nombre original en metadatos
    const meta = readMeta();
    meta[req.file.filename] = {
      originalName: req.file.originalname,
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    };
    saveMeta(meta);

    res.status(201).json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url,
        size: req.file.size,
        uploadedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ success: false, message: 'Error al subir la imagen' });
  }
};

// Listar imágenes
exports.getImages = (req, res) => {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      return res.json({ success: true, data: [] });
    }

    const meta = readMeta();
    const files = fs.readdirSync(UPLOAD_DIR);
    const images = files
      .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
      .map(f => {
        const stat = fs.statSync(path.join(UPLOAD_DIR, f));
        return {
          filename: f,
          originalName: meta[f]?.originalName || f,
          url: `/uploads/images/${f}`,
          size: stat.size,
          uploadedAt: meta[f]?.uploadedAt || stat.birthtime
        };
      })
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.json({ success: true, data: images });
  } catch (error) {
    console.error('Error al obtener imágenes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener imágenes' });
  }
};

// Eliminar imagen
exports.deleteImage = (req, res) => {
  try {
    const safe = path.basename(req.params.filename);
    const filePath = path.join(UPLOAD_DIR, safe);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Imagen no encontrada' });
    }

    fs.unlinkSync(filePath);

    // Limpiar metadatos
    const meta = readMeta();
    delete meta[safe];
    saveMeta(meta);

    res.json({ success: true, message: 'Imagen eliminada' });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar la imagen' });
  }
};
