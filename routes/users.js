const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { authenticate, adminOnly } = require('../middleware/auth');

router.use(authenticate);

router.get('/', adminOnly, ctrl.getAllUsers);
router.get('/:id', ctrl.getUserById);
router.put('/profile/me', ctrl.updateProfile);
router.put('/:id', adminOnly, ctrl.updateUser);
router.delete('/:id', adminOnly, ctrl.deleteUser);

module.exports = router;
