const router = require('express').Router();
const ctrl = require('../controllers/projectController');
const taskCtrl = require('../controllers/taskController');
const { authenticate, adminOnly } = require('../middleware/auth');

router.use(authenticate);

router.get('/', ctrl.getAllProjects);
router.get('/:id', ctrl.getProjectById);
router.post('/', adminOnly, ctrl.createProject);
router.put('/:id', adminOnly, ctrl.updateProject);
router.delete('/:id', adminOnly, ctrl.deleteProject);

// Nested task routes
router.get('/:projectId/tasks', taskCtrl.getTasksByProject);
router.post('/:projectId/tasks', adminOnly, taskCtrl.createTask);

module.exports = router;
