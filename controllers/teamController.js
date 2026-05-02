const Team = require('../models/Team');
const User = require('../models/User');

exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('members', 'name email avatar role')
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members', 'name email avatar role')
      .populate('createdBy', 'name');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const { name, description, color, members } = req.body;
    const team = await Team.create({
      name, description, color: color || '#6366f1',
      members: members || [],
      createdBy: req.user._id,
    });
    // Update team field on users
    if (members && members.length) {
      await User.updateMany({ _id: { $in: members } }, { team: team._id });
    }
    await team.populate('members', 'name email avatar role');
    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const { name, description, color, members } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // Remove team from old members not in new list
    const oldMembers = team.members.map(String);
    const newMembers = members || [];
    const removed = oldMembers.filter((m) => !newMembers.includes(m));
    const added = newMembers.filter((m) => !oldMembers.includes(m));

    if (removed.length) await User.updateMany({ _id: { $in: removed } }, { team: null });
    if (added.length) await User.updateMany({ _id: { $in: added } }, { team: team._id });

    const updated = await Team.findByIdAndUpdate(
      req.params.id,
      { name, description, color, members: newMembers },
      { new: true }
    ).populate('members', 'name email avatar role');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    await User.updateMany({ team: req.params.id }, { team: null });
    res.json({ message: 'Team deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
