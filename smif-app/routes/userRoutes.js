const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const claseController = require('../controllers/claseController');

router.get('/perfil', authMiddleware, userController.getProfile);
router.get('/alumnos', authMiddleware, requireRole('docente'), userController.getAlumnos);

router.get('/clases/mias', authMiddleware, claseController.mias);
router.post('/clases', authMiddleware, requireRole('docente'), claseController.crear);
router.delete('/clases/:id', authMiddleware, requireRole('docente'), claseController.eliminarClase);
router.post('/clases/:id/alumnos', authMiddleware, requireRole('docente'), claseController.agregarAlumno);
router.delete('/clases/:id/alumnos/:alumnoId', authMiddleware, requireRole('docente'), claseController.quitarAlumno);

module.exports = router;
