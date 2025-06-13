const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { register, login, updateUser, forgotPassword, resetPassword, deleteUser } = require('../controllers/authcontroller');


router.post('/register', register);
router.post('/login', login);
router.put('/me', protect, updateUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.delete('/me', protect, deleteUser);

module.exports = router;
