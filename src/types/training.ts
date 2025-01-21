import { z } from 'zod'

export const TrainingTypeSchema = z.enum([
  'run',
  'cross_train',
  'rest',
  'race',
  'strength',
  'recovery'
])

export type TrainingType = z.infer<typeof TrainingTypeSchema>

export const TrainingGoalSchema = z.object({
  id: z.string(),
  title: z.string(),
  targetDate: z.string(),
  type: z.enum(['distance', 'time', 'race']),
  target: z.object({
    value: z.number(),
    unit: z.enum(['km', 'mi', 'min']),
  }),
  progress: z.number(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'missed']),
})

export const TrainingSessionSchema = z.object({
  id: z.string(),
  type: TrainingTypeSchema,
  date: z.string(),
  duration: z.number(), // in minutes
  distance: z.number().optional(), // in kilometers
  notes: z.string().optional(),
  completed: z.boolean(),
  metrics: z.object({
    pace: z.number().optional(), // min/km
    heartRate: z.number().optional(), // bpm
    effort: z.number().optional(), // 1-10
  }).optional(),
})

export const TrainingPlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  goal: TrainingGoalSchema,
  schedule: z.array(TrainingSessionSchema),
  restDays: z.array(z.number()), // 0-6 for days of week
  notes: z.string().optional(),
})

export type TrainingGoal = z.infer<typeof TrainingGoalSchema>
export type TrainingSession = z.infer<typeof TrainingSessionSchema>
export type TrainingPlan = z.infer<typeof TrainingPlanSchema>

export interface TrainingState {
  currentPlan: TrainingPlan | null
  goals: TrainingGoal[]
  sessions: TrainingSession[]
  isLoading: boolean
  error: string | null
} 