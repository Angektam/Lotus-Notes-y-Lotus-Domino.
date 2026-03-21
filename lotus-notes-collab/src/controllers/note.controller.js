const { Note, User } = require('../models');

exports.createNote = async (req, res) => {
  try {
    const { title, content, category, priority, isPublic, tags } = req.body;

    if (!title || !title.trim()) return res.status(400).json({ error: 'El título es obligatorio' });
    if (title.trim().length > 200) return res.status(400).json({ error: 'El título no puede exceder 200 caracteres' });
    if (!content || !content.trim()) return res.status(400).json({ error: 'El contenido es obligatorio' });
    if (category && category.length > 50) return res.status(400).json({ error: 'La categoría no puede exceder 50 caracteres' });
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (priority && !validPriorities.includes(priority)) return res.status(400).json({ error: 'Prioridad inválida' });

    const note = await Note.create({
      title,
      content,
      category,
      priority,
      isPublic,
      tags,
      userId: req.user.id
    });

    res.status(201).json({ message: 'Nota creada', note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const { category, priority, page = 1, limit = 20 } = req.query;
    const where = { userId: req.user.id };

    if (category) where.category = category;
    if (priority) where.priority = priority;

    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    const { count, rows: notes } = await Note.findAndCountAll({
      where,
      include: [{ model: User, as: 'author', attributes: ['id', 'username', 'fullName'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      notes,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPublicNotes = async (req, res) => {
  try {
    const notes = await Note.findAll({
      where: { isPublic: true, status: 'published' },
      include: [{ model: User, as: 'author', attributes: ['id', 'username', 'fullName'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findOne({ where: { id, userId: req.user.id } });

    if (!note) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }

    await note.update(req.body);
    res.json({ message: 'Nota actualizada', note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findOne({ where: { id, userId: req.user.id } });

    if (!note) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }

    await note.destroy();
    res.json({ message: 'Nota eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
