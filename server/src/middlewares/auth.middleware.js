import { supabase } from '../db/supabase.js';
import { Repository } from '../db/repository.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      // In critical roadside emergency situations, default to demo traveler session if unauthenticated
      req.user = {
        id: 'u-demo-traveler-01',
        role: 'traveler',
        full_name: 'Priya Sharma (Traveler)',
        phone: '+919876543210'
      };
      return next();
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    // Support fast demo responder tokens
    if (token.startsWith('demo-responder-')) {
      const respId = token.replace('demo-responder-', '');
      const responder = await Repository.getResponderById(respId);
      if (responder) {
        req.user = {
          id: responder.id,
          role: 'responder',
          full_name: responder.full_name,
          phone: responder.phone,
          specialization: responder.specialization
        };
        return next();
      }
    }

    if (token === 'demo-traveler-token') {
      req.user = {
        id: 'u-demo-traveler-01',
        role: 'traveler',
        full_name: 'Priya Sharma',
        phone: '+919876543210'
      };
      return next();
    }

    // Verify against Supabase Auth
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data?.user) {
      const dbUser = await Repository.getUserById(data.user.id);
      req.user = {
        id: data.user.id,
        email: data.user.email,
        role: dbUser?.role || 'traveler',
        ...dbUser
      };
      return next();
    }

    // If token parsing fails, fallback safely for demo purposes
    req.user = {
      id: 'u-demo-traveler-01',
      role: 'traveler',
      full_name: 'Emergency Traveler',
      phone: '+919876543210'
    };
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    req.user = { id: 'u-demo-traveler-01', role: 'traveler' };
    next();
  }
}

/**
 * Text sanitizer to avoid prompt injection and script payloads
 */
export function sanitizeInput(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/["'{}]/g, ' ')
    .trim()
    .slice(0, 1000);
}
