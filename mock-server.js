const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ============ DATOS MOCK ============

const usuarios = [
  { id: 1, nombreCompleto: 'Admin DentalPro', email: 'admin@dental.com', rol: 'ADMINISTRADOR', activo: true },
  { id: 2, nombreCompleto: 'María Recepcionista', email: 'maria@dental.com', rol: 'RECEPCIONISTA', activo: true },
  { id: 3, nombreCompleto: 'Dr. Carlos Odontólogo', email: 'carlos@dental.com', rol: 'ODONTOLOGO', activo: true },
];

const pacientes = [
  { id: 1, nombreCompleto: 'Juan Pérez García', dni: '12345678', fechaNacimiento: '1990-05-15', telefono: '987654321', email: 'juan@gmail.com' },
  { id: 2, nombreCompleto: 'Ana López Martínez', dni: '87654321', fechaNacimiento: '1985-03-20', telefono: '912345678', email: 'ana@gmail.com' },
  { id: 3, nombreCompleto: 'Pedro Sánchez Ruiz', dni: '11223344', fechaNacimiento: '1978-11-08', telefono: '945678123', email: 'pedro@gmail.com' },
  { id: 4, nombreCompleto: 'Laura Torres Díaz', dni: '55667788', fechaNacimiento: '1995-07-22', telefono: '956789012', email: 'laura@gmail.com' },
  { id: 5, nombreCompleto: 'Roberto Flores Vega', dni: '99887766', fechaNacimiento: '1982-01-30', telefono: '967890123', email: 'roberto@gmail.com' },
];

const citas = [
  { id: 1, pacienteId: 1, pacienteNombre: 'Juan Pérez García', odontologoId: 3, odontologoNombre: 'Dr. Carlos Odontólogo', fecha: getTodayString(), hora: '09:00', motivo: 'Limpieza dental', estado: 'PENDIENTE' },
  { id: 2, pacienteId: 2, pacienteNombre: 'Ana López Martínez', odontologoId: 3, odontologoNombre: 'Dr. Carlos Odontólogo', fecha: getTodayString(), hora: '10:00', motivo: 'Dolor de muela', estado: 'PENDIENTE' },
  { id: 3, pacienteId: 3, pacienteNombre: 'Pedro Sánchez Ruiz', odontologoId: 3, odontologoNombre: 'Dr. Carlos Odontólogo', fecha: getTodayString(), hora: '11:00', motivo: 'Control de ortodoncia', estado: 'ATENDIDO' },
  { id: 4, pacienteId: 4, pacienteNombre: 'Laura Torres Díaz', odontologoId: 3, odontologoNombre: 'Dr. Carlos Odontólogo', fecha: getTodayString(), hora: '14:00', motivo: 'Extracción', estado: 'CANCELADO' },
];

const reportes = [
  { id: 1, citaId: 3, pacienteNombre: 'Pedro Sánchez Ruiz', odontologoNombre: 'Dr. Carlos Odontólogo', diagnostico: 'Ortodoncia en buen progreso', tratamiento: 'Ajuste de brackets', observaciones: 'Próximo control en 4 semanas', fecha: getTodayString() },
];

let nextPacienteId = 6;
let nextCitaId = 5;
let nextUsuarioId = 4;
let nextReporteId = 2;

// ============ HELPERS ============

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function createToken(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({
    sub: String(user.id),
    rol: user.rol,
    exp: Math.floor(Date.now() / 1000) + 86400, // 24 horas
    iat: Math.floor(Date.now() / 1000)
  })).toString('base64');
  return `${header}.${payload}.mock-signature`;
}

// ============ AUTH ============

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = usuarios.find(u => u.email === email);

  if (!user || password !== '123456') {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  res.json({
    token: createToken(user),
    user: { id: user.id, nombreCompleto: user.nombreCompleto, email: user.email, rol: user.rol }
  });
});

// ============ PACIENTES ============

app.get('/api/pacientes', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const size = parseInt(req.query.size) || 10;
  const start = (page - 1) * size;
  const content = pacientes.slice(start, start + size);

  res.json({
    content,
    totalElements: pacientes.length,
    totalPages: Math.ceil(pacientes.length / size),
    currentPage: page,
    size
  });
});

app.get('/api/pacientes/buscar', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const results = pacientes.filter(p =>
    p.nombreCompleto.toLowerCase().includes(q) || p.dni.includes(q)
  );
  res.json(results);
});

app.get('/api/pacientes/:id', (req, res) => {
  const p = pacientes.find(p => p.id === parseInt(req.params.id));
  p ? res.json(p) : res.status(404).json({ message: 'Paciente no encontrado' });
});

app.post('/api/pacientes', (req, res) => {
  if (pacientes.find(p => p.dni === req.body.dni)) {
    return res.status(409).json({ message: 'DNI ya registrado' });
  }
  const nuevo = { id: nextPacienteId++, ...req.body };
  pacientes.push(nuevo);
  res.status(201).json(nuevo);
});

app.put('/api/pacientes/:id', (req, res) => {
  const idx = pacientes.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'No encontrado' });
  pacientes[idx] = { ...pacientes[idx], ...req.body };
  res.json(pacientes[idx]);
});

app.delete('/api/pacientes/:id', (req, res) => {
  const idx = pacientes.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'No encontrado' });
  pacientes.splice(idx, 1);
  res.status(204).send();
});

// ============ CITAS ============

app.get('/api/citas', (req, res) => {
  const fecha = req.query.fecha || getTodayString();
  res.json(citas.filter(c => c.fecha === fecha));
});

app.get('/api/citas/disponibilidad', (req, res) => {
  const { odontologoId, fecha, hora } = req.query;
  const conflicto = citas.find(c =>
    c.odontologoId === parseInt(odontologoId) &&
    c.fecha === fecha &&
    c.hora === hora &&
    (c.estado === 'PENDIENTE' || c.estado === 'REAGENDADO')
  );
  res.json(!conflicto);
});

app.get('/api/citas/:id', (req, res) => {
  const c = citas.find(c => c.id === parseInt(req.params.id));
  c ? res.json(c) : res.status(404).json({ message: 'Cita no encontrada' });
});

app.post('/api/citas', (req, res) => {
  const paciente = pacientes.find(p => p.id === req.body.pacienteId);
  const odontologo = usuarios.find(u => u.id === req.body.odontologoId);
  const nueva = {
    id: nextCitaId++,
    ...req.body,
    pacienteNombre: paciente?.nombreCompleto || 'Desconocido',
    odontologoNombre: odontologo?.nombreCompleto || 'Desconocido',
    estado: 'PENDIENTE'
  };
  citas.push(nueva);
  res.status(201).json(nueva);
});

app.put('/api/citas/:id', (req, res) => {
  const idx = citas.findIndex(c => c.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'No encontrada' });
  citas[idx] = { ...citas[idx], ...req.body, estado: 'REAGENDADO' };
  res.json(citas[idx]);
});

app.patch('/api/citas/:id/cancelar', (req, res) => {
  const idx = citas.findIndex(c => c.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'No encontrada' });
  citas[idx].estado = 'CANCELADO';
  res.json(citas[idx]);
});

app.patch('/api/citas/:id/estado', (req, res) => {
  const idx = citas.findIndex(c => c.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'No encontrada' });
  citas[idx].estado = req.body.estado;
  res.json(citas[idx]);
});

app.put('/api/citas/:id/finalizar', (req, res) => {
  const idx = citas.findIndex(c => c.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'No encontrada' });
  citas[idx].estado = 'ATENDIDO';
  res.status(204).send();
});

// ============ ATENCIONES ============

app.post('/api/atenciones', (req, res) => {
  const nota = { id: nextReporteId, ...req.body, fecha: getTodayString() };
  res.status(201).json(nota);
});

// ============ USUARIOS ============

app.get('/api/usuarios', (req, res) => res.json(usuarios));

app.get('/api/usuarios/odontologos', (req, res) => {
  res.json(usuarios.filter(u => u.rol === 'ODONTOLOGO'));
});

app.get('/api/usuarios/:id', (req, res) => {
  const u = usuarios.find(u => u.id === parseInt(req.params.id));
  u ? res.json(u) : res.status(404).json({ message: 'Usuario no encontrado' });
});

app.post('/api/usuarios', (req, res) => {
  if (usuarios.find(u => u.email === req.body.email)) {
    return res.status(409).json({ message: 'Email ya registrado' });
  }
  const nuevo = { id: nextUsuarioId++, ...req.body, activo: true };
  usuarios.push(nuevo);
  res.status(201).json(nuevo);
});

app.put('/api/usuarios/:id', (req, res) => {
  const idx = usuarios.findIndex(u => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'No encontrado' });
  usuarios[idx] = { ...usuarios[idx], ...req.body };
  res.json(usuarios[idx]);
});

app.delete('/api/usuarios/:id', (req, res) => {
  const idx = usuarios.findIndex(u => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'No encontrado' });
  usuarios.splice(idx, 1);
  res.status(204).send();
});

// ============ REPORTES ============

app.get('/api/reportes', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const size = parseInt(req.query.size) || 10;
  res.json({
    content: reportes,
    totalElements: reportes.length,
    totalPages: Math.ceil(reportes.length / size),
    currentPage: page,
    size
  });
});

app.get('/api/reportes/cita/:citaId', (req, res) => {
  const r = reportes.find(r => r.citaId === parseInt(req.params.citaId));
  r ? res.json(r) : res.status(404).json({ message: 'Reporte no encontrado' });
});

app.post('/api/reportes/generar/:citaId', (req, res) => {
  const cita = citas.find(c => c.id === parseInt(req.params.citaId));
  const reporte = {
    id: nextReporteId++,
    citaId: parseInt(req.params.citaId),
    pacienteNombre: cita?.pacienteNombre || 'Desconocido',
    odontologoNombre: cita?.odontologoNombre || 'Desconocido',
    diagnostico: 'Diagnóstico generado',
    tratamiento: 'Tratamiento realizado',
    observaciones: '',
    fecha: getTodayString()
  };
  reportes.push(reporte);
  res.status(201).json(reporte);
});

app.get('/api/reportes/:id/pdf', (req, res) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=reporte-${req.params.id}.pdf`);
  res.send(Buffer.from('%PDF-1.4 mock pdf content'));
});

// ============ START ============

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`\n🦷 Mock Server DentalPro corriendo en http://localhost:${PORT}`);
  console.log(`\n📋 Credenciales de prueba:`);
  console.log(`   Admin:        admin@dental.com / 123456`);
  console.log(`   Recepcionista: maria@dental.com / 123456`);
  console.log(`   Odontólogo:   carlos@dental.com / 123456`);
  console.log(`\n🚀 Abre http://localhost:4200/login para iniciar sesión\n`);
});
