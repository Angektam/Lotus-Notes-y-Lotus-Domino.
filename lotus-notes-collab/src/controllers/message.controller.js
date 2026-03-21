const { Message, User } = require('../models');

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, subject, body, priority } = req.body;

    if (!receiverId || isNaN(parseInt(receiverId)) || parseInt(receiverId) <= 0)
      return res.status(400).json({ error: 'El destinatario es inválido' });
    if (parseInt(receiverId) === req.user.id)
      return res.status(400).json({ error: 'No puedes enviarte un mensaje a ti mismo' });
    if (!subject || !subject.trim()) return res.status(400).json({ error: 'El asunto es obligatorio' });
    if (subject.trim().length > 200) return res.status(400).json({ error: 'El asunto no puede exceder 200 caracteres' });
    if (!body || !body.trim()) return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    const validPriorities = ['low', 'normal', 'high'];
    if (priority && !validPriorities.includes(priority)) return res.status(400).json({ error: 'Prioridad inválida' });

    const receiver = await User.findByPk(parseInt(receiverId));
    if (!receiver) return res.status(404).json({ error: 'El destinatario no existe' });

    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      subject,
      body,
      priority
    });

    res.status(201).json({ message: 'Mensaje enviado', data: message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInbox = async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { receiverId: req.user.id },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'fullName'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSentMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { senderId: req.user.id },
      include: [
        { model: User, as: 'receiver', attributes: ['id', 'username', 'fullName'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findOne({
      where: { id, receiverId: req.user.id }
    });

    if (!message) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }

    await message.update({ isRead: true });
    res.json({ message: 'Mensaje marcado como leído' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
