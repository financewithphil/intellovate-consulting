import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'intellovate-dev-secret-change-in-prod';

// Parse ADMIN_PINS env: "name:pin,name:pin" → { pin: name }
function parsePins() {
  const raw = process.env.ADMIN_PINS || 'phil:1234';
  const map = {};
  for (const entry of raw.split(',')) {
    const [name, pin] = entry.trim().split(':');
    if (name && pin) map[pin] = name;
  }
  return map;
}

export function verifyPin(pin) {
  const pins = parsePins();
  const name = pins[pin];
  if (!name) return null;
  const token = jwt.sign({ role: 'admin', name }, JWT_SECRET, { expiresIn: '24h' });
  return { token, name };
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
