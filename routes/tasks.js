const router = require('express').Router();
const ctrl = require('../controllers/taskController');
const { authenticate, adminOnly } = require('../middleware/auth');

router.use(authenticate);

router.get('/my', ctrl.getMyTasks);
router.get('/', adminOnly, ctrl.getAllTasks);
router.post('/', adminOnly, ctrl.createTask);
router.put('/:id', ctrl.updateTask);
router.delete('/:id', adminOnly, ctrl.deleteTask);

module.exports = router;
