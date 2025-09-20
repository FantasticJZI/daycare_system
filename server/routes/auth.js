const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateUser, 
  validateLogin, 
  validatePasswordReset, 
  validatePasswordUpdate 
} = require('../middleware/validation');

// 公開路由
router.post('/register', validateUser, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', validatePasswordReset, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// 需要認證的路由
router.use(authenticateToken);

router.post('/logout', authController.logout);
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.put('/change-password', validatePasswordUpdate, authController.changePassword);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;

