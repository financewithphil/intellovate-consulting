import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { verifyPin } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'intellovate-dev-secret-change-in-prod';
const router = Router();

router.post('/login', (req, res) => {
  const { pin } = req.body;
  if (!pin) return res.status(400).json({ error: 'PIN required' });

  const result = verifyPin(pin);
  if (!result) return res.status(401).json({ error: 'Invalid PIN' });

  res.json({ token: result.token, name: result.name });
});

router.get('/verify', (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false });
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    res.json({ valid: true, name: decoded.name, role: decoded.role });
  } catch {
    res.status(401).json({ valid: false });
  }
});

export default router;
