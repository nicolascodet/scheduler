import { CalendarEvent } from './calendar'
import { TrainingPlan, TrainingGoal, TrainingSession } from './training'
import { Project, Task, Milestone } from './project'

export type CommandType = 
  | 'query_schedule'
  | 'create_event'
  | 'update_event'
  | 'delete_event'
  | 'suggest_time'
  | 'general_query'
  // Training commands
  | 'create_training_plan'
  | 'update_training_plan'
  | 'log_training_session'
  | 'query_training_progress'
  | 'update_training_goal'
  // Project commands
  | 'create_project'
  | 'update_project'
  | 'create_task'
  | 'update_task'
  | 'create_milestone'
  | 'update_milestone'
  | 'query_project_status'

export interface ParsedCommand {
  type: CommandType
  dates?: {
    start?: Date
    end?: Date
  }
  eventDetails?: Partial<CalendarEvent>
  eventId?: string
  query?: string
  // Training-specific fields
  trainingPlan?: Partial<TrainingPlan>
  trainingGoal?: Partial<TrainingGoal>
  trainingSession?: Partial<TrainingSession>
  // Project-specific fields
  project?: Partial<Project>
  task?: Partial<Task>
  milestone?: Partial<Milestone>
  projectId?: string
  taskId?: string
  milestoneId?: string
}

export interface AssistantContext {
  events: CalendarEvent[]
  timezone: string
  userEmail: string
  lastQuery?: string
  lastCommand?: ParsedCommand
  // Training context
  currentTrainingPlan?: TrainingPlan | null
  trainingGoals?: TrainingGoal[]
  recentTrainingSessions?: TrainingSession[]
  // Project context
  currentProject?: Project | null
  recentTasks?: Task[]
  upcomingMilestones?: Milestone[]
}

export interface AssistantResponse {
  message: string
  command?: ParsedCommand
  suggestedActions?: {
    type: CommandType
    label: string
    payload: any
  }[]
}

export interface ChatContext {
  recentEvents: CalendarEvent[]
  upcomingEvents: CalendarEvent[]
  lastCommand?: ParsedCommand
  lastActionResult?: {
    success: boolean
    message?: string
  }
  // Training context
  currentTrainingPlan?: TrainingPlan | null
  recentTrainingSessions?: TrainingSession[]
  // Project context
  currentProject?: Project | null
  recentTasks?: Task[]
} 