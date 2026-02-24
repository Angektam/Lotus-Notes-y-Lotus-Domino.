const { Note, User } = require('../models');

exports.createNote = async (req, res) => {
  try {
    const { title, content, category, priority, isPublic, tags } = req.body;
    
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
    const notes = await Note.findAll({
      where: { userId: req.user.id },
      include: [{ model: User, as: 'author', attributes: ['id', 'username', 'fullName'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ notes });
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
