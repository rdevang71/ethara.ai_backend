const Task = require('../models/Task');
const { recalcProgress } = require('./projectController');

exports.getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name')
      .sort('createdAt');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('project', 'name status priority')
      .populate('assignedTo', 'name avatar email')
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'name status priority')
      .populate('assignedTo', 'name avatar')
      .sort('-createdAt');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate, project } = req.body;
    const task = await Task.create({
      title, description, status, priority, assignedTo, dueDate,
      project: project || req.params.projectId,
      createdBy: req.user._id,
    });
    await recalcProgress(task.project);
    await task.populate('assignedTo', 'name email avatar');
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Users can only update progress/notes/status on their own tasks
    if (req.user.role !== 'admin') {
      if (String(task.assignedTo) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      const { progress, status, notes } = req.body;
      Object.assign(task, { progress, status, notes });
    } else {
      Object.assign(task, req.body);
    }

    await task.save();
    await recalcProgress(task.project);
    await task.populate('assignedTo', 'name email avatar');
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await recalcProgress(task.project);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
