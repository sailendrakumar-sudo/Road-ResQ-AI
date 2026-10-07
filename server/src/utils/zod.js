import { z } from 'zod';

export const ReportEmergencySchema = z.object({
  description: z.string().min(3, 'Description must be at least 3 characters').max(1000),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  imageUrl: z.string().optional().nullable(),
  isNight: z.boolean().default(false),
  isFemaleModeRequested: z.boolean().default(false),
  vehicleType: z.string().optional().default('Sedan'),
  emergencyContact: z.string().optional()
});

export const RescueUpdateSchema = z.object({
  status: z.enum(['dispatched', 'arrived', 'failed', 'completed']),
  failureReason: z.string().optional()
});

export const RegisterUserSchema = z.object({
  phone: z.string().min(8),
  fullName: z.string().min(2),
  role: z.enum(['traveler', 'responder']).default('traveler'),
  emergencyContact: z.string().optional(),
  specialization: z.string().optional()
});
