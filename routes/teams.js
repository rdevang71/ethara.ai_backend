const router = require('express').Router();
const ctrl = require('../controllers/teamController');
const { authenticate, adminOnly } = require('../middleware/auth');

router.use(authenticate);

router.get('/', ctrl.getAllTeams);
router.get('/:id', ctrl.getTeamById);
router.post('/', adminOnly, ctrl.createTeam);
router.put('/:id', adminOnly, ctrl.updateTeam);
router.delete('/:id', adminOnly, ctrl.deleteTeam);

module.exports = router;
