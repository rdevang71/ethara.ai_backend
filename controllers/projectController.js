const Project = require('../models/Project');
const Task = require('../models/Task');

exports.getAllProjects = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query = { assignedTo: req.user._id };
    }
    const projects = await Project.find(query)
      .populate('team', 'name color')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('team', 'name color members')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Non-admin can only view assigned projects
    if (req.user.role !== 'admin' &&
      !project.assignedTo.some((u) => String(u._id) === String(req.user._id))) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { name, description, status, priority, team, assignedTo, startDate, dueDate } = req.body;
    const project = await Project.create({
      name, description, status, priority, team, assignedTo: assignedTo || [],
      startDate, dueDate, createdBy: req.user._id,
    });
    await project.populate([
      { path: 'team', select: 'name color' },
      { path: 'assignedTo', select: 'name email avatar' },
    ]);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('team', 'name color')
      .populate('assignedTo', 'name email avatar');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await Task.deleteMany({ project: req.params.id });
    res.json({ message: 'Project and its tasks deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.recalcProgress = async (projectId) => {
  const tasks = await Task.find({ project: projectId });
  if (!tasks.length) return;
  const avg = tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length;
  await Project.findByIdAndUpdate(projectId, { progress: Math.round(avg) });
};
