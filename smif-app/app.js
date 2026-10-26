require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const { COOKIE_NAME } = require('./config/constants');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const seed = require('./data/seed');

const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

if (!process.env.SESSION_SECRET) {
  console.error('Falta SESSION_SECRET en el archivo .env');
  process.exit(1);
}

const app = express();
app.disable('x-powered-by');
if (isProd) app.set('trust proxy', 1); 
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin'
  });
  next();
});

app.use(express.json({ limit: '10kb' }));

app.use(
  session({
    name: COOKIE_NAME,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,       
      sameSite: 'lax',     
      secure: isProd,      
      maxAge: 1000 * 60 * 60 * 2
    }
  })
);

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', (req, res) => {
  res.status(404).json({ status: 'fail', message: 'Ruta no encontrada' });
});

app.use(express.static(path.join(__dirname, 'public')));

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ status: 'fail', message: 'JSON inválido' });
  }
  console.error(err);
  res.status(500).json({ status: 'fail', message: 'Error interno del servidor' });
});

seed().then(() => {
  app.listen(PORT, () => {
    console.log(`SMIF ejecutándose en http://localhost:${PORT}`);
  });
});
