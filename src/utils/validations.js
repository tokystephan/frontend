import { z } from 'zod'

//  LOGIN
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide'),
  password: z
    .string()
    .min(1, 'Mot de passe requis')
    .min(8, 'Au moins 8 caractères'),
})

//  REGISTER
export const registerSchema = z.object({
  username: z
    .string()
    .min(1, 'Nom d\'utilisateur requis')
    .min(3, 'Au moins 3 caractères')
    .max(50, 'Maximum 50 caractères'),
  first_name: z
    .string()
    .min(1, 'Prénom requis')
    .max(100, 'Maximum 100 caractères'),
  last_name: z
    .string()
    .min(1, 'Nom requis')
    .max(100, 'Maximum 100 caractères'),
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide')
    .max(150, 'Maximum 150 caractères'),
  password: z
    .string()
    .min(1, 'Mot de passe requis')
    .min(8, 'Au moins 8 caractères'),
  password_confirmation: z
    .string()
    .min(1, 'Confirmation requise'),
  role_name: z
    .string()
    .min(1, 'Rôle requis')
    .refine(
      (val) => ['assistant', 'manager', 'direction'].includes(String(val).toLowerCase().trim()),
      'Rôle invalide'
    ),
}).superRefine((data, ctx) => {
  if (data.password !== data.password_confirmation) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Les mots de passe ne correspondent pas',
      path: ['password_confirmation']
    })
  }
})

// ✅ APPLICATION (CANDIDATURE)
export const applicationSchema = z.object({
  candidate_id: z
    .number()
    .min(1, 'Candidat requis'),
  post_id: z
    .number()
    .min(1, 'Poste requis'),
  status: z
    .string()
    .min(1, 'Statut requis'),
  current_status_id: z
    .number()
    .min(1, 'Statut requis')
    .optional()
    .nullable(),
  source_id: z
    .number()
    .optional()
    .nullable(),
  expected_salary: z
    .number()
    .optional()
    .nullable(),
  notes: z.string().optional().nullable().default(''),
  comments: z.string().optional().nullable().default(''),
  assigned_to: z.string().optional().nullable().default(''),
})

// ✅ CANDIDATE (CANDIDAT)
export const candidateSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, 'Prénom requis')
    .regex(/^[A-Za-zÀ-ÿ\s'-]+$/, 'Le prénom ne doit contenir que des lettres'),
  last_name: z
    .string()
    .trim()
    .min(1, 'Nom requis')
    .regex(/^[A-Za-zÀ-ÿ\s'-]+$/, 'Le nom ne doit contenir que des lettres'),
  email: z.string().email('Email invalide'),
  phone: z.string().nullable().optional(),           // ← accepte null, undefined ou chaîne vide
  source: z.union([z.number(), z.string()]).nullable().optional(),
  documents: z.array(z.string()).default([]),
});

// ✅ POST (POSTE)
export const postSchema = z.object({
  title: z
    .string()
    .min(1, 'Titre requis')
    .max(200, 'Maximum 200 caractères'),
  description: z
    .string()
    .min(1, 'Description requise'),
  department_id: z
    .number()
    .min(1, 'Département requis'),
  salary_min: z
    .number()
    .optional()
    .nullable(),
  salary_max: z
    .number()
    .optional()
    .nullable(),
  is_active: z
    .boolean()
    .default(true),
})

// ✅ STATUS (STATUT)
export const statusSchema = z.object({
  name: z
    .string()
    .min(1, 'Nom du statut requis')
    .max(50, 'Maximum 50 caractères'),
  step_order: z
    .number()
    .min(1, 'Ordre requis'),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Couleur invalide'),
  is_final: z
    .boolean()
    .default(false),
})

// ✅ FORGOT PASSWORD
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide'),
})

// ✅ RESET PASSWORD
export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, 'Token requis'),
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide'),
  password: z
    .string()
    .min(8, 'Au moins 8 caractères'),
  password_confirmation: z
    .string()
    .min(1, 'Confirmation requise'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirmation'],
})
