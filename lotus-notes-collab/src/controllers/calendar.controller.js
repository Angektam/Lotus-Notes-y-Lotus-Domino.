const { Calendar, User } = require('../models');

exports.createEvent = async (req, res) => {
  try {
    const { title, description, startDate, endDate, location, eventType, isAllDay } = req.body;
    
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
