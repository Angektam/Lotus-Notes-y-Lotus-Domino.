const { Op } = require('sequelize');
const { Task, User } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

exports.createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, dueDate, assignedTo } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'El título es obligatorio' });
  }
  if (dueDate && new Date(dueDate) < new Date()) {
    return res.status(400).json({ error: 'La fecha de vencimiento no puede ser en el pasado' });
  }

  const task = await Task.create({
    title: title.trim(),
    description: description?.trim(),
    priority: priority || 'medium',
    dueDate,
    assignedTo: assignedTo || req.user.id,
    createdBy: req.user.id
  });

  res.status(201).json({ message: 'Tarea creada', task });
});

exports.getMyTasks = asyncHandler(async (req, res) => {
  const { status, priority, page = 1, limit = 20 } = req.query;
  const where = { assignedTo: req.user.id };

  if (status) where.status = status;
  if (priority) where.priority = priority;

  const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

  const { count, rows: tasks } = await Task.findAndCountAll({
    where,
    include: [
      { model: User, as: 'creator', attributes: ['id', 'username', 'fullName'] },
      { model: User, as: 'assignee', attributes: ['id', 'username', 'fullName'] }
    ],
    order: [['dueDate', 'ASC']],
    limit: parseInt(limit),
    offset
  });

  res.json({
    tasks,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit))
    }
  });
});

exports.getTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await Task.findOne({
    where: {
      id,
      [Op.or]: [{ createdBy: req.user.id }, { assignedTo: req.user.id }]
    },
    include: [
      { model: User, as: 'creator', attributes: ['id', 'username', 'fullName'] },
      { model: User, as: 'assignee', attributes: ['id', 'username', 'fullName'] }
    ]
  });

  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json({ task });
});

exports.updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await Task.findOne({
    where: {
      id,
      [Op.or]: [{ createdBy: req.user.id }, { assignedTo: req.user.id }]
    }
  });

  if (!task) return res.status(404).json({ error: 'Tarea no encontrada o sin permisos' });

  const { title, description, priority, dueDate, status } = req.body;

  if (title !== undefined && !title.trim()) {
    return res.status(400).json({ error: 'El título no puede estar vacío' });
  }

  await task.update({
    title: title?.trim() ?? task.title,
    description: description?.trim() ?? task.description,
    priority: priority ?? task.priority,
    dueDate: dueDate ?? task.dueDate,
    status: status ?? task.status
  });

  res.json({ message: 'Tarea actualizada', task });
});

exports.deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await Task.findOne({ where: { id, createdBy: req.user.id } });

  if (!task) return res.status(404).json({ error: 'Tarea no encontrada o sin permisos' });

  await task.destroy();
  res.json({ message: 'Tarea eliminada' });
});
