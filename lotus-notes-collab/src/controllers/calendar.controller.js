const { Calendar, User } = require('../models');

exports.createEvent = async (req, res) => {
  try {
    const { title, description, startDate, endDate, location, eventType, isAllDay } = req.body;

    if (!title || !title.trim()) return res.status(400).json({ error: 'El título es obligatorio' });
    if (title.trim().length > 200) return res.status(400).json({ error: 'El título no puede exceder 200 caracteres' });
    if (!startDate) return res.status(400).json({ error: 'La fecha de inicio es obligatoria' });
    if (!endDate) return res.status(400).json({ error: 'La fecha de fin es obligatoria' });
    if (new Date(endDate) < new Date(startDate)) return res.status(400).json({ error: 'La fecha de fin no puede ser anterior a la fecha de inicio' });
    const durationHours = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60);
    if (durationHours > 720) return res.status(400).json({ error: 'El evento no puede durar más de 30 días' });
    if (location && location.length > 200) return res.status(400).json({ error: 'La ubicación no puede exceder 200 caracteres' });
    const validTypes = ['meeting', 'reminder', 'appointment', 'event'];
    if (eventType && !validTypes.includes(eventType)) return res.status(400).json({ error: 'Tipo de evento inválido' });

    const event = await Calendar.create({
      title,
      description,
      startDate,
      endDate,
      location,
      eventType,
      isAllDay,
      userId: req.user.id
    });

    res.status(201).json({ message: 'Evento creado', event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Calendar.findAll({
      where: { userId: req.user.id },
      include: [{ model: User, as: 'organizer', attributes: ['id', 'username', 'fullName'] }],
      order: [['startDate', 'ASC']]
    });

    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Calendar.findOne({ where: { id, userId: req.user.id } });

    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    await event.update(req.body);
    res.json({ message: 'Evento actualizado', event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Calendar.findOne({ where: { id, userId: req.user.id } });

    if (!event) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    await event.destroy();
    res.json({ message: 'Evento eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
