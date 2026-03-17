const { Task, User } = require('../models');

exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedTo } = req.body;
    
    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.user.id
    });

    res.status(201).json({ message: 'Tarea creada', task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { assignedTo: req.user.id },
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'fullName'] },
        { model: User, as: 'assignee', attributes: ['id', 'username', 'fullName'] }
      ],
      order: [['dueDate', 'ASC']]
    });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    // Solo el creador o el asignado puede modificar la tarea
    const task = await Task.findOne({
      where: {
        id,
        [require('sequelize').Op.or]: [
          { createdBy: req.user.id },
          { assignedTo: req.user.id }
        ]
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada o sin permisos' });
    }

    // Evitar que se sobreescriban campos sensibles
    const { title, description, priority, dueDate, status } = req.body;
    await task.update({ title, description, priority, dueDate, status });
    res.json({ message: 'Tarea actualizada', task });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    // Solo el creador puede eliminar la tarea
    const task = await Task.findOne({
      where: { id, createdBy: req.user.id }
    });

    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada o sin permisos' });
    }

    await task.destroy();
    res.json({ message: 'Tarea eliminada' });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
