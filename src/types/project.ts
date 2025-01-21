import { z } from 'zod'

export const TaskStatusSchema = z.enum([
  'backlog',
  'todo',
  'in_progress',
  'review',
  'done'
])

export const TaskPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent'
])

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  completedDate: z.string().optional(),
  assignee: z.string().optional(),
  dependencies: z.array(z.string()), // Array of task IDs
  progress: z.number(), // 0-100
  tags: z.array(z.string()),
  estimatedHours: z.number().optional(),
})

export const MilestoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  dueDate: z.string(),
  completedDate: z.string().optional(),
  tasks: z.array(z.string()), // Array of task IDs
  status: z.enum(['not_started', 'in_progress', 'completed', 'missed']),
})

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(['active', 'completed', 'on_hold', 'cancelled']),
  tasks: z.array(TaskSchema),
  milestones: z.array(MilestoneSchema),
  team: z.array(z.string()), // Array of user IDs/emails
  tags: z.array(z.string()),
})

export type TaskStatus = z.infer<typeof TaskStatusSchema>
export type TaskPriority = z.infer<typeof TaskPrioritySchema>
export type Task = z.infer<typeof TaskSchema>
export type Milestone = z.infer<typeof MilestoneSchema>
export type Project = z.infer<typeof ProjectSchema>

export interface ProjectState {
  projects: Project[]
  selectedProject: Project | null
  isLoading: boolean
  error: string | null
} 