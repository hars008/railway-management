const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('./database');

const JWT_SECRET = process.env.JWT_SECRET ;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

const authenticateUser = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication token not found' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'authentication failed' });
  }
};

const requireAdmin = (req, res, next) => {
  const adminApiKey = req.header('X-Admin-API-Key');
  
  if (!adminApiKey || adminApiKey !== ADMIN_API_KEY) {
    return res.status(403).json({ error: "Admin access required" });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (inputPassword, hashedPassword) => {
  return bcrypt.compare(inputPassword, hashedPassword);
};

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role 
    }, 
    JWT_SECRET, 
    { expiresIn: '2h' }
  );
};

module.exports = {
  authenticateUser,
  requireAdmin,
  hashPassword,
  comparePassword,
  generateToken,
  ADMIN_API_KEY
};
