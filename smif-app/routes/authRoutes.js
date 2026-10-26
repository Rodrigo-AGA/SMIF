const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAdminKey } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/register', requireAdminKey, authController.register); 

module.exports = router;
