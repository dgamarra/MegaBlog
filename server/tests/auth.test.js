/**
 * Pruebas de autenticación de usuario — MegaBlog (server)
 *
 * Estructura: rutas felices (happy), infelices (unhappy) y casos borde (edge)
 *   1. POST /api/auth/register
 *   2. POST /api/auth/login
 *   3. Flujo completo registro → login
 *   4. authMiddleware / adminMiddleware
 *   5. Integración con una ruta protegida real (POST /api/posts)
 *
 * Nota sobre el aislamiento: el código del servidor es CommonJS y sus
 * require() resuelven de forma nativa, por lo que vi.mock() NO puede
 * interceptar el repositorio. En su lugar se reemplazan métodos del
 * singleton real (userRepository / postRepository) y se restauran en
 * afterEach. bcrypt y jsonwebtoken se usan de verdad para validar la
 * criografía real.
 */
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { createRequire } from 'node:module';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const nodeRequire = createRequire(import.meta.url);

// Instancias nativas: las mismas que usa la aplicación bajo prueba
const app = nodeRequire('../src/app.js');
const userRepository = nodeRequire('../src/repositories/userRepository.js');
const postRepository = nodeRequire('../src/repositories/postRepository.js');
const { authMiddleware, adminMiddleware } = nodeRequire('../src/middleware/authMiddleware.js');

// Mismo secreto que usan authService y authMiddleware
const SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Si una prueba olvida stub, falla en 2s con "buffering timed out"
// en vez de colgarse 10s esperando MongoDB.
nodeRequire('mongoose').set('bufferTimeoutMS', 2000);

const PASSWORD = 'Secret123!';
let hashedPassword; // hash real calculado una sola vez

// Métodos originales que se restauran tras cada prueba
const original = {
  findByEmail: userRepository.findByEmail,
  create: userRepository.create,
  getById: userRepository.getById,
  postCreate: postRepository.create,
};

const makeUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'Ana Torres',
  email: 'ana@example.com',
  password: hashedPassword,
  role: 'user',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const signToken = (payload, options = {}) =>
  jwt.sign(payload, SECRET, { expiresIn: '1d', ...options });

// res falso para probar los middlewares sin HTTP
const fakeRes = () => {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};

beforeAll(async () => {
  hashedPassword = await bcrypt.hash(PASSWORD, 10);
});

beforeEach(() => {
  // Por defecto: el usuario NO existe. Cada prueba ajusta lo que necesite.
  userRepository.findByEmail = vi.fn().mockResolvedValue(null);
  userRepository.create = vi.fn();
  userRepository.getById = vi.fn().mockResolvedValue(null);
  postRepository.create = vi.fn();
});

afterEach(() => {
  userRepository.findByEmail = original.findByEmail;
  userRepository.create = original.create;
  userRepository.getById = original.getById;
  postRepository.create = original.postCreate;
});

// ---------------------------------------------------------------------------
// 1. POST /api/auth/register
// ---------------------------------------------------------------------------
describe('POST /api/auth/register', () => {
  it('feliz: registra un usuario nuevo y devuelve 201 sin la contraseña', async () => {
    userRepository.create.mockImplementation(async (data) => ({ id: 'user-2', ...data }));

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ana Torres', email: 'ana@example.com', password: PASSWORD });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: 'user-2',
      name: 'Ana Torres',
      email: 'ana@example.com',
      role: 'user', // rol por defecto
    });
    expect(res.body.password).toBeUndefined(); // nunca se filtra

    // La contraseña se guarda hasheada con bcrypt, nunca en texto plano
    expect(userRepository.create).toHaveBeenCalledTimes(1);
    const saved = userRepository.create.mock.calls[0][0];
    expect(saved.password).not.toBe(PASSWORD);
    expect(saved.password.startsWith('$2')).toBe(true);
    expect(bcrypt.compareSync(PASSWORD, saved.password)).toBe(true);
  });

  it('infeliz: rechaza el registro si el email ya existe', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Otra Persona', email: 'ana@example.com', password: PASSWORD });

    expect(res.status).toBe(409); // Conflict: el email ya está registrado
    expect(res.body.error.message).toBe('User already exists');
    expect(userRepository.create).not.toHaveBeenCalled(); // no se duplica el registro
  });

  it('infeliz: sin cuerpo en la petición responde 500', async () => {
    const res = await request(app).post('/api/auth/register');

    expect(res.status).toBe(500);
    expect(res.body.error.message).toMatch(/Cannot read properties of undefined/);
    expect(userRepository.findByEmail).not.toHaveBeenCalled();
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('borde: faltan campos requeridos → validación de Mongoose (sin tocar la BD)', async () => {
    // Dejamos correr la validación real del modelo
    userRepository.create = original.create;

    const sinEmail = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ana', password: PASSWORD });
    expect(sinEmail.status).toBe(500);
    expect(sinEmail.body.error.message).toMatch(/validation failed.*email/i);

    const sinNombre = await request(app)
      .post('/api/auth/register')
      .send({ email: 'ana@example.com', password: PASSWORD });
    expect(sinNombre.status).toBe(500);
    expect(sinNombre.body.error.message).toMatch(/validation failed.*name/i);
  });

  it('borde: sin contraseña → bcrypt rechaza los argumentos ilegales', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ana Torres', email: 'ana@example.com' });

    expect(res.status).toBe(500);
    expect(res.body.error.message).toMatch(/Illegal arguments/);
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('borde: ignora el rol que envíe el cliente y fuerza el rol "user"', async () => {
    userRepository.create.mockImplementation(async (data) => ({ id: 'user-9', ...data }));

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin', email: 'admin@example.com', password: PASSWORD, role: 'admin' });

    // Regresión de seguridad: aunque el cliente pida 'admin', se guarda 'user'
    expect(res.status).toBe(201);
    expect(res.body.role).toBe('user');
    expect(userRepository.create.mock.calls[0][0].role).toBe('user');
  });
});

// ---------------------------------------------------------------------------
// 2. POST /api/auth/login
// ---------------------------------------------------------------------------
describe('POST /api/auth/login', () => {
  it('feliz: credenciales correctas → 200 con usuario y token JWT verificable', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@example.com', password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      id: 'user-1',
      name: 'Ana Torres',
      email: 'ana@example.com',
      role: 'user',
    });
    expect(res.body.user.password).toBeUndefined(); // nunca se filtra

    // El token es un JWT válido con el secreto configurado y los claims esperados
    expect(typeof res.body.token).toBe('string');
    const decoded = jwt.verify(res.body.token, SECRET);
    expect(decoded).toMatchObject({ id: 'user-1', role: 'user', name: 'Ana Torres' });
    expect(decoded.exp - decoded.iat).toBe(86400); // expira en 1 día
  });

  it('infeliz: no distingue entre usuario inexistente y contraseña incorrecta', async () => {
    const inexistente = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nadie@example.com', password: PASSWORD });

    userRepository.findByEmail.mockResolvedValue(makeUser());
    const passwordIncorrecta = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@example.com', password: 'otra-contrasena' });

    // Misma respuesta en ambos casos (401): no permite enumerar usuarios.
    expect(inexistente.status).toBe(401);
    expect(passwordIncorrecta.status).toBe(401);
    expect(inexistente.body).toEqual(passwordIncorrecta.body);
    expect(inexistente.body.error.message).toBe('Invalid credentials');
  });

  it('infeliz: cuerpo JSON vacío → 401 Invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({});

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Invalid credentials');
    expect(userRepository.findByEmail).toHaveBeenCalledWith(undefined);
  });

  it('infeliz: sin cuerpo en la petición → 500 (no se puede desestructurar)', async () => {
    const res = await request(app).post('/api/auth/login');

    expect(res.status).toBe(500);
    expect(res.body.error.message).toMatch(/Cannot destructure property 'email'/);
    expect(userRepository.findByEmail).not.toHaveBeenCalled();
  });

  it('borde: contraseña vacía → 401 Invalid credentials', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@example.com', password: '' });

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Invalid credentials');
  });

  it('borde: hash corrupto en la BD → 401 Invalid credentials (no filtra el motivo)', async () => {
    userRepository.findByEmail.mockResolvedValue(
      makeUser({ password: 'no-es-un-hash-bcrypt' })
    );

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@example.com', password: PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Invalid credentials');
  });

  it('borde: contraseña ausente con usuario existente → error de bcrypt (500)', async () => {
    userRepository.findByEmail.mockResolvedValue(makeUser());

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@example.com' });

    expect(res.status).toBe(500);
    expect(res.body.error.message).toMatch(/Illegal arguments/);
  });

  it('borde: el email llega al repositorio sin normalizar (respeta mayúsculas)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ANA@Example.COM', password: PASSWORD });

    expect(userRepository.findByEmail).toHaveBeenCalledWith('ANA@Example.COM');
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Invalid credentials');
  });
});

// ---------------------------------------------------------------------------
// 3. Flujo completo registro → login
// ---------------------------------------------------------------------------
describe('flujo completo registro → login', () => {
  it('feliz: registrar un usuario y luego iniciar sesión con esas credenciales', async () => {
    // Mini-almacén en memoria que sustituye a MongoDB
    const store = [];
    userRepository.findByEmail = vi.fn(
      async (email) => store.find((u) => u.email === email) ?? null
    );
    userRepository.create = vi.fn(async (data) => {
      const user = { id: `user-${store.length + 1}`, ...data };
      store.push(user);
      return user;
    });

    const registro = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ana Torres', email: 'ana@example.com', password: PASSWORD });
    expect(registro.status).toBe(201);
    expect(store).toHaveLength(1);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@example.com', password: PASSWORD });
    expect(login.status).toBe(200);
    expect(login.body.user.email).toBe('ana@example.com');
    expect(login.body.user.password).toBeUndefined();
    expect(() => jwt.verify(login.body.token, SECRET)).not.toThrow();

    // Contraseña equivocada tras el registro sigue siendo rechazada
    const loginMal = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@example.com', password: 'contrasena-mala' });
    expect(loginMal.status).toBe(401);
    expect(loginMal.body.error.message).toBe('Invalid credentials');
  });
});

// ---------------------------------------------------------------------------
// 4. authMiddleware / adminMiddleware
// ---------------------------------------------------------------------------
describe('authMiddleware', () => {
  it('feliz: token Bearer válido → llama a next() y adjunta req.user', () => {
    const token = signToken({ id: 'user-1', role: 'user', name: 'Ana Torres' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = fakeRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.user).toMatchObject({ id: 'user-1', role: 'user', name: 'Ana Torres' });
  });

  it('infeliz: sin cabecera Authorization → 401 No token provided', () => {
    const req = { headers: {} };
    const res = fakeRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
  });

  it('infeliz: token firmado con otro secreto → 401 Invalid token', () => {
    const token = jwt.sign({ id: 'user-1', role: 'admin' }, 'otro-secreto', {
      expiresIn: '1d',
    });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = fakeRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
  });

  it('borde: token expirado → 401 Invalid token', () => {
    const token = signToken({ id: 'user-1', role: 'user' }, { expiresIn: '-1s' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = fakeRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
  });

  it('borde: token con algoritmo "none" (bypass clásico) → 401 Invalid token', () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ id: 'user-1', role: 'admin' })).toString('base64url');
    const token = `${header}.${payload}.`;
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = fakeRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
  });

  it('borde: cabecera sin prefijo "Bearer" ("Token abc") → 401 Invalid token', () => {
    const req = { headers: { authorization: 'Token abc123' } };
    const res = fakeRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
  });

  it('borde: cabecera solo con "Bearer" (sin token) → 401 No token provided', () => {
    const req = { headers: { authorization: 'Bearer' } };
    const res = fakeRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
  });

  it('borde: payload incompleto (sin id o sin role) → 401 Invalid token', () => {
    // Tokens con firma válida pero sin los campos que emite el login
    for (const payload of [{ name: 'Ana Torres' }, { id: 'user-1' }]) {
      const token = signToken(payload);
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = fakeRes();
      const next = vi.fn();

      authMiddleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    }
  });
});

describe('adminMiddleware', () => {
  it('feliz: usuario con role admin → llama a next()', () => {
    const req = { user: { id: 'user-1', role: 'admin' } };
    const res = fakeRes();
    const next = vi.fn();

    adminMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('infeliz: usuario normal → 403 Admin access required', () => {
    const req = { user: { id: 'user-1', role: 'user' } };
    const res = fakeRes();
    const next = vi.fn();

    adminMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Admin access required' });
  });

  it('infeliz: sin req.user (sin autenticar) → 403', () => {
    const req = {};
    const res = fakeRes();
    const next = vi.fn();

    adminMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('borde: req.user sin role → 403 (solo "admin" pasa)', () => {
    const req = { user: { id: 'user-1' } };
    const res = fakeRes();
    const next = vi.fn();

    adminMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Admin access required' });
  });
});

// ---------------------------------------------------------------------------
// 5. Integración: la ruta protegida real usa authMiddleware
// ---------------------------------------------------------------------------
describe('integración: POST /api/posts (ruta protegida)', () => {
  it('infeliz: sin token → 401 No token provided', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: 'Secreto', content: 'Solo con token' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'No token provided' });
    expect(postRepository.create).not.toHaveBeenCalled();
  });

  it('infeliz: token inválido → 401 Invalid token', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', 'Bearer token-falsificado')
      .send({ title: 'Secreto', content: 'Solo con token válido' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid token' });
    expect(postRepository.create).not.toHaveBeenCalled();
  });

  it('feliz: token válido → pasa el middleware y crea el post (201)', async () => {
    postRepository.create.mockImplementation(async (data) => ({ id: 'post-1', ...data }));
    const token = signToken({ id: 'user-1', role: 'user', name: 'Ana Torres' });

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Mi primer post', content: 'Excelente artículo, muy útil e interesante.' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: 'post-1',
      title: 'Mi primer post',
      authorId: 'user-1', // sale del token, no del body
    });
    expect(res.body).toHaveProperty('sentiment'); // análisis NLP ejecutado
    expect(userRepository.getById).toHaveBeenCalledWith('user-1');
  });
});
