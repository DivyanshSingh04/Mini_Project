import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../../src/models/User');
const Grievance = require('../../src/models/Grievance');
const Scheme = require('../../src/models/Scheme');

// Cached DB connection across warm invocations
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  const uri = Netlify.env.get('MONGO_URI') || process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not set');
  await mongoose.connect(uri);
}

// JWT helpers
function getJWTSecret() {
  return Netlify.env.get('JWT_SECRET') || process.env.JWT_SECRET;
}

function generateToken(id) {
  const expire = Netlify.env.get('JWT_EXPIRE') || process.env.JWT_EXPIRE || '7d';
  return jwt.sign({ id }, getJWTSecret(), { expiresIn: expire });
}

// Auth middleware: returns user or null
async function authenticate(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, getJWTSecret());
    return await User.findById(decoded.id);
  } catch {
    return null;
  }
}

// JSON response helpers
function json(data, status = 200) {
  return Response.json(data, { status });
}

function unauthorized(message = 'Access denied. Please login first.') {
  return json({ success: false, message }, 401);
}

function forbidden(roles) {
  return json({ success: false, message: `Access denied. Only ${roles.join(', ')} can access this.` }, 403);
}

// Simple path matcher: returns params or null
function matchPath(pattern, pathname) {
  const patternParts = pattern.split('/');
  const pathParts = pathname.split('/');
  if (patternParts.length !== pathParts.length) return null;
  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

// Error handler
function handleError(error) {
  let statusCode = 500;
  let message = error.message || 'Internal Server Error';

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    message = `${field} already exists. Please use a different value.`;
    statusCode = 400;
  }
  if (error.name === 'ValidationError') {
    message = Object.values(error.errors).map((val) => val.message).join(', ');
    statusCode = 400;
  }
  if (error.name === 'JsonWebTokenError') {
    message = 'Invalid token.';
    statusCode = 401;
  }

  return json({ success: false, message }, statusCode);
}

// ──────────────────────────── AUTH ROUTES ────────────────────────────

async function handleAuthRegister(req) {
  const { name, email, password, phone, age, village, district, state } = await req.json();
  if (age < 18) {
    return json({ success: false, message: 'You must be 18 or older to register.' }, 400);
  }
  const user = await User.create({ name, email, password, phone, age, village, district, state });
  const token = generateToken(user._id);
  return json({
    success: true, message: 'Registration successful!', token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, village: user.village, district: user.district },
  }, 201);
}

async function handleAuthLogin(req) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return json({ success: false, message: 'Please provide email and password.' }, 400);
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return json({ success: false, message: 'Invalid email or password.' }, 401);
  }
  const token = generateToken(user._id);
  return json({
    success: true, message: 'Login successful!', token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, village: user.village, district: user.district },
  });
}

async function handleAuthMe(user) {
  return json({ success: true, user });
}

async function handleAuthUpdateProfile(req, user) {
  const { name, phone, village, district, state } = await req.json();
  const updated = await User.findByIdAndUpdate(
    user._id, { name, phone, village, district, state }, { new: true, runValidators: true }
  );
  return json({ success: true, message: 'Profile updated successfully.', user: updated });
}

// ──────────────────────────── GRIEVANCE ROUTES ────────────────────────────

async function handleTrackGrievance(ticketId) {
  const grievance = await Grievance.findOne({ ticketId })
    .populate('citizen', 'name village district')
    .populate('assignedOfficer', 'name email');
  if (!grievance) {
    return json({ success: false, message: 'No grievance found with this ticket ID.' }, 404);
  }
  return json({
    success: true,
    grievance: {
      ticketId: grievance.ticketId, title: grievance.title, category: grievance.category,
      status: grievance.status, priority: grievance.priority, location: grievance.location,
      adminRemarks: grievance.adminRemarks, statusHistory: grievance.statusHistory,
      submittedOn: grievance.createdAt, lastUpdated: grievance.updatedAt,
    },
  });
}

async function handleSubmitGrievance(req, user) {
  const { title, description, category, priority } = await req.json();
  const grievance = await Grievance.create({
    citizen: user._id, title, description, category, priority,
    location: { village: user.village, district: user.district, state: user.state },
    statusHistory: [{ status: 'pending', changedBy: user._id, remark: 'Grievance submitted by citizen.' }],
  });
  return json({ success: true, message: 'Grievance submitted successfully!', ticketId: grievance.ticketId, grievance }, 201);
}

async function handleMyGrievances(user) {
  const grievances = await Grievance.find({ citizen: user._id }).sort({ createdAt: -1 });
  return json({ success: true, count: grievances.length, grievances });
}

async function handleAllGrievances(url) {
  const params = url.searchParams;
  const status = params.get('status');
  const category = params.get('category');
  const district = params.get('district');
  const page = Number(params.get('page')) || 1;
  const limit = Number(params.get('limit')) || 10;

  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (district) filter['location.district'] = district;

  const skip = (page - 1) * limit;
  const grievances = await Grievance.find(filter)
    .populate('citizen', 'name phone village district')
    .populate('assignedOfficer', 'name email')
    .sort({ createdAt: -1 }).skip(skip).limit(limit);
  const total = await Grievance.countDocuments(filter);

  return json({ success: true, total, page, pages: Math.ceil(total / limit), grievances });
}

async function handleGrievanceStats() {
  const total = await Grievance.countDocuments();
  const pending = await Grievance.countDocuments({ status: 'pending' });
  const inProgress = await Grievance.countDocuments({ status: 'in_progress' });
  const resolved = await Grievance.countDocuments({ status: 'resolved' });
  const rejected = await Grievance.countDocuments({ status: 'rejected' });
  const byCategory = await Grievance.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return json({ success: true, stats: { total, pending, inProgress, resolved, rejected, byCategory } });
}

async function handleUpdateGrievanceStatus(req, user, id) {
  const { status, remark, assignedOfficer } = await req.json();
  const grievance = await Grievance.findById(id);
  if (!grievance) return json({ success: false, message: 'Grievance not found.' }, 404);

  grievance.status = status;
  if (remark) grievance.adminRemarks = remark;
  if (assignedOfficer) grievance.assignedOfficer = assignedOfficer;
  grievance.statusHistory.push({ status, changedBy: user._id, remark: remark || `Status updated to ${status}` });
  await grievance.save();

  return json({ success: true, message: 'Grievance status updated.', grievance });
}

// ──────────────────────────── SCHEME ROUTES ────────────────────────────

async function handleGetAllSchemes(url) {
  const params = url.searchParams;
  const category = params.get('category');
  const gender = params.get('gender');
  const search = params.get('search');

  const filter = { isActive: true };
  if (category) filter.category = category;
  if (gender) filter['eligibility.gender'] = { $in: [gender, 'all'] };
  if (search) filter.name = { $regex: search, $options: 'i' };

  const schemes = await Scheme.find(filter).sort({ createdAt: -1 });
  return json({ success: true, count: schemes.length, schemes });
}

async function handleGetSchemeById(id) {
  const scheme = await Scheme.findById(id);
  if (!scheme) return json({ success: false, message: 'Scheme not found.' }, 404);
  return json({ success: true, scheme });
}

async function handleCheckEligibility(user, id) {
  const scheme = await Scheme.findById(id);
  if (!scheme) return json({ success: false, message: 'Scheme not found.' }, 404);

  const { minAge, maxAge, gender } = scheme.eligibility;
  const reasons = [];
  if (user.age < minAge) reasons.push(`Minimum age required is ${minAge}.`);
  if (user.age > maxAge) reasons.push(`Maximum age limit is ${maxAge}.`);
  if (gender !== 'all' && user.gender && user.gender !== gender) {
    reasons.push(`This scheme is only for ${gender}.`);
  }

  if (reasons.length === 0) {
    return json({
      success: true, eligible: true, message: 'You are eligible for this scheme!',
      scheme: { name: scheme.name, benefits: scheme.benefits, applicationProcess: scheme.applicationProcess },
    });
  }
  return json({ success: true, eligible: false, message: 'You are not eligible for this scheme.', reasons });
}

async function handleAddScheme(req, user) {
  const body = await req.json();
  const scheme = await Scheme.create({ ...body, addedBy: user._id });
  return json({ success: true, message: 'Scheme added successfully.', scheme }, 201);
}

async function handleUpdateScheme(req, id) {
  const body = await req.json();
  const scheme = await Scheme.findByIdAndUpdate(id, body, { new: true, runValidators: true });
  if (!scheme) return json({ success: false, message: 'Scheme not found.' }, 404);
  return json({ success: true, message: 'Scheme updated.', scheme });
}

async function handleDeleteScheme(id) {
  await Scheme.findByIdAndDelete(id);
  return json({ success: true, message: 'Scheme deleted successfully.' });
}

// ──────────────────────────── ADMIN ROUTES ────────────────────────────

async function handleAdminDashboard() {
  const totalUsers = await User.countDocuments({ role: 'citizen' });
  const totalGrievances = await Grievance.countDocuments();
  const pendingGrievances = await Grievance.countDocuments({ status: 'pending' });
  const resolvedGrievances = await Grievance.countDocuments({ status: 'resolved' });
  const recentGrievances = await Grievance.find()
    .populate('citizen', 'name village district')
    .sort({ createdAt: -1 }).limit(5);

  return json({
    success: true,
    dashboard: { totalUsers, totalGrievances, pendingGrievances, resolvedGrievances, recentGrievances },
  });
}

async function handleGetAllUsers() {
  const users = await User.find({ role: 'citizen' }).sort({ createdAt: -1 });
  return json({ success: true, count: users.length, users });
}

async function handleChangeUserRole(req, id) {
  const { role } = await req.json();
  const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  if (!user) return json({ success: false, message: 'User not found.' }, 404);
  return json({ success: true, message: `User role updated to ${role}.`, user });
}

async function handleDeleteUser(id) {
  await User.findByIdAndDelete(id);
  return json({ success: true, message: 'User deleted successfully.' });
}

// ──────────────────────────── MAIN HANDLER ────────────────────────────

export default async (req, context) => {
  try {
    await connectDB();

    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/api/, '');
    const method = req.method;

    // ── Auth routes ──
    if (method === 'POST' && path === '/auth/register') return await handleAuthRegister(req);
    if (method === 'POST' && path === '/auth/login') return await handleAuthLogin(req);

    if (method === 'GET' && path === '/auth/me') {
      const user = await authenticate(req);
      if (!user) return unauthorized();
      return await handleAuthMe(user);
    }
    if (method === 'PUT' && path === '/auth/update-profile') {
      const user = await authenticate(req);
      if (!user) return unauthorized();
      return await handleAuthUpdateProfile(req, user);
    }

    // ── Grievance routes ──
    let params;

    params = matchPath('/grievances/track/:ticketId', path);
    if (method === 'GET' && params) return await handleTrackGrievance(params.ticketId);

    if (method === 'POST' && path === '/grievances') {
      const user = await authenticate(req);
      if (!user) return unauthorized();
      if (user.role !== 'citizen') return forbidden(['citizen']);
      return await handleSubmitGrievance(req, user);
    }

    if (method === 'GET' && path === '/grievances/my') {
      const user = await authenticate(req);
      if (!user) return unauthorized();
      if (user.role !== 'citizen') return forbidden(['citizen']);
      return await handleMyGrievances(user);
    }

    if (method === 'GET' && path === '/grievances/all') {
      const user = await authenticate(req);
      if (!user) return unauthorized();
      if (!['admin', 'officer'].includes(user.role)) return forbidden(['admin', 'officer']);
      return await handleAllGrievances(url);
    }

    if (method === 'GET' && path === '/grievances/stats') {
      const user = await authenticate(req);
      if (!user) return unauthorized();
      if (user.role !== 'admin') return forbidden(['admin']);
      return await handleGrievanceStats();
    }

    params = matchPath('/grievances/:id/status', path);
    if (method === 'PUT' && params) {
      const user = await authenticate(req);
      if (!user) return unauthorized();
      if (!['admin', 'officer'].includes(user.role)) return forbidden(['admin', 'officer']);
      return await handleUpdateGrievanceStatus(req, user, params.id);
    }

    // ── Scheme routes ──
    if (method === 'GET' && path === '/schemes') return await handleGetAllSchemes(url);

    params = matchPath('/schemes/:id/check-eligibility', path);
    if (method === 'POST' && params) {
      const user = await authenticate(req);
      if (!user) return unauthorized();
      return await handleCheckEligibility(user, params.id);
    }

    if (method === 'POST' && path === '/schemes') {
      const user = await authenticate(req);
      if (!user) return unauthorized();
      if (user.role !== 'admin') return forbidden(['admin']);
      return await handleAddScheme(req, user);
    }

    params = matchPath('/schemes/:id', path);
    if (params) {
      if (method === 'GET') return await handleGetSchemeById(params.id);
      if (method === 'PUT') {
        const user = await authenticate(req);
        if (!user) return unauthorized();
        if (user.role !== 'admin') return forbidden(['admin']);
        return await handleUpdateScheme(req, params.id);
      }
      if (method === 'DELETE') {
        const user = await authenticate(req);
        if (!user) return unauthorized();
        if (user.role !== 'admin') return forbidden(['admin']);
        return await handleDeleteScheme(params.id);
      }
    }

    // ── Admin routes ──
    if (path.startsWith('/admin')) {
      const user = await authenticate(req);
      if (!user) return unauthorized();
      if (user.role !== 'admin') return forbidden(['admin']);

      if (method === 'GET' && path === '/admin/dashboard') return await handleAdminDashboard();
      if (method === 'GET' && path === '/admin/users') return await handleGetAllUsers();

      params = matchPath('/admin/users/:id/role', path);
      if (method === 'PUT' && params) return await handleChangeUserRole(req, params.id);

      params = matchPath('/admin/users/:id', path);
      if (method === 'DELETE' && params) return await handleDeleteUser(params.id);
    }

    // ── Welcome / 404 ──
    if (path === '' || path === '/') {
      return json({ success: true, message: 'Welcome to e-GramSAARTHI API', version: '1.0.0' });
    }

    return json({ success: false, message: 'Route not found.' }, 404);
  } catch (error) {
    return handleError(error);
  }
};

export const config = {
  path: '/api/*',
};
