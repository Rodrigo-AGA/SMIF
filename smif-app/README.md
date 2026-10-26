# Academia SMIF – Aula virtual (Laboratorio 07)

Backend en **Express** + frontend (HTML/CSS/JS con Bootstrap) en `public/`.
Autenticación con **bcryptjs**, sesiones con **express-session**, secretos en **.env** (dotenv).

## Ejecutar
```bash
npm install
npm start
```
Abrir http://localhost:3000 (el frontend necesita internet para cargar Bootstrap por CDN).

Usuarios de prueba (contraseña `smif2026`):
- Estudiante: DNI `12345678` o `23456789`
- Docente: DNI `34567890` o `45678901`

## Cómo funciona
No hay registro público: la academia (secretaría) registra a los usuarios.
La persona elige **Estudiante** o **Docente**, escribe su **DNI** y su **contraseña**.
El servidor verifica que el DNI exista con ese perfil y que la contraseña coincida con el hash.

## Endpoints
| Método | Ruta | Acceso |
|---|---|---|
| POST | /api/auth/login `{ rol, dni, password }` | Público |
| POST | /api/auth/logout | Sesión |
| POST | /api/auth/register | Solo secretaría (cabecera `x-admin-key`) |
| GET | /api/perfil | Cualquier usuario autenticado (401 sin sesión) |
| GET | /api/alumnos | Solo docentes (401 sin sesión, 403 si es alumno) |

## Seguridad implementada
- Contraseñas con **bcrypt (10 salt rounds)**; el hash nunca sale en ninguna respuesta.
- `SESSION_SECRET` y `ADMIN_KEY` solo en `.env` (excluido de Git).
- Cookie de sesión `httpOnly`, `sameSite: lax`, `secure` en producción, expira en 2 horas.
- Nuevo ID de sesión al hacer login (evita fijación de sesión) y cookie borrada al hacer logout.
- Mismo mensaje si falla el DNI, el perfil o la contraseña, y comparación bcrypt también cuando el DNI no existe (no revela qué DNIs existen).
- Bloqueo de 15 minutos tras 5 intentos fallidos (por IP + DNI).
- Validación de entradas, cuerpo JSON limitado a 10 KB y cabeceras básicas de seguridad.
- El rol se toma de la base de datos y se guarda en la sesión del servidor; el navegador no puede cambiarlo.

## Pruebas con curl (PowerShell: usar `curl.exe`)
```bash
# Login guardando la cookie
curl.exe -c cookies.txt -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"rol\":\"alumno\",\"dni\":\"12345678\",\"password\":\"smif2026\"}"

# Ruta protegida
curl.exe -b cookies.txt http://localhost:3000/api/perfil

# Sin sesión -> 401
curl.exe http://localhost:3000/api/perfil

# Alumno intentando una ruta de docente -> 403
curl.exe -b cookies.txt http://localhost:3000/api/alumnos

# Logout
curl.exe -b cookies.txt -X POST http://localhost:3000/api/auth/logout

# Registrar un usuario nuevo (secretaría): usar el ADMIN_KEY de tu .env
curl.exe -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -H "x-admin-key: TU_ADMIN_KEY" -d "{\"rol\":\"alumno\",\"nombre\":\"Rosa\",\"apellidos\":\"Vega\",\"dni\":\"56789012\",\"email\":\"rosa@correo.com\",\"celular\":\"912345678\",\"password\":\"Clave1234\",\"ciclo\":\"Ciclo 3\",\"modalidad\":\"virtual\"}"
```

## Limitaciones (a resolver en el Lab 08/09)
- Los usuarios viven en memoria (`data/userStore.js`): **se pierden al reiniciar**, y se vuelven a cargar solo los de prueba.
  Las funciones del store están pensadas para reemplazarse por PostgreSQL sin tocar los controladores.
- `express-session` usa `MemoryStore` (no apto para producción ni para varias instancias): usar Redis o PostgreSQL.
- Para desplegar: `NODE_ENV=production` y HTTPS.
