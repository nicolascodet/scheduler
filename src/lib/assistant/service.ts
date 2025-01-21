import Anthropic from '@anthropic-ai/sdk'
import { parseISO, isValid, format, addDays, subDays } from 'date-fns'
import { AssistantContext, AssistantResponse, ParsedCommand } from '@/types/assistant'
import { CalendarEvent } from '@/types/calendar'
import { TrainingPlan, TrainingSession, TrainingGoal } from '@/types/training'
import { Project, Task, Milestone, TaskStatus } from '@/types/project'
import { getUserTimeZone } from '../google-calendar/utils'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `You are a helpful calendar assistant that helps users manage their schedule, training plans, and projects.
You can create, update, and query calendar events, training sessions, and project tasks.

When responding to user queries:
1. Analyze the intent of the message
2. For schedule queries, reference the provided calendar events
3. For training queries, consider the training plan and recent sessions
4. For project queries, check project status and upcoming milestones
5. Provide clear, concise responses
6. When suggesting times, consider conflicts across all types of events
7. Use the user's timezone for all times

Output your response in JSON format with:
- message: Your response to the user
- command: (optional) The parsed command with extracted details
- suggestedActions: (optional) Follow-up actions the user might want to take

Keep responses brief and focused on schedule management.`

interface CommandParserResponse {
  command: ParsedCommand
  error?: string
}

// Parse natural language into structured commands
async function parseCommand(
  message: string,
  context: AssistantContext
): Promise<CommandParserResponse> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0,
      system: `${SYSTEM_PROMPT}
        Your task is to parse the user message into a structured command.
        Current timezone: ${context.timezone}
        Current time: ${new Date().toISOString()}
        Training plan: ${context.currentTrainingPlan ? JSON.stringify(context.currentTrainingPlan) : 'none'}
        Current project: ${context.currentProject ? JSON.stringify(context.currentProject) : 'none'}
        
        Output JSON with command details including:
        - type: CommandType
        - dates: { start, end } (optional)
        - eventDetails: CalendarEvent details (optional)
        - trainingPlan: TrainingPlan details (optional)
        - trainingSession: TrainingSession details (optional)
        - project: Project details (optional)
        - task: Task details (optional)
        - milestone: Milestone details (optional)
        - query: string (optional)`,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    })

    const parsedResponse = JSON.parse(response.content[0].text) as ParsedCommand
    
    // Validate dates if present
    if (parsedResponse.dates) {
      if (parsedResponse.dates.start) {
        const startDate = parseISO(parsedResponse.dates.start.toString())
        if (!isValid(startDate)) {
          throw new Error('Invalid start date')
        }
        parsedResponse.dates.start = startDate
      }
      if (parsedResponse.dates.end) {
        const endDate = parseISO(parsedResponse.dates.end.toString())
        if (!isValid(endDate)) {
          throw new Error('Invalid end date')
        }
        parsedResponse.dates.end = endDate
      }
    }

    return { command: parsedResponse }
  } catch (error) {
    return {
      command: { type: 'general_query', query: message },
      error: 'Failed to parse command',
    }
  }
}

// Check for scheduling conflicts across all event types
function findConflicts(
  start: Date,
  end: Date,
  context: AssistantContext
): Array<CalendarEvent | TrainingSession | Task> {
  const conflicts: Array<CalendarEvent | TrainingSession | Task> = []

  // Check calendar events
  context.events.forEach(event => {
    const eventStart = parseISO(event.start.dateTime)
    const eventEnd = parseISO(event.end.dateTime)
    
    if (
      (start >= eventStart && start < eventEnd) ||
      (end > eventStart && end <= eventEnd) ||
      (start <= eventStart && end >= eventEnd)
    ) {
      conflicts.push(event)
    }
  })

  // Check training sessions
  if (context.recentTrainingSessions) {
    context.recentTrainingSessions.forEach(session => {
      const sessionDate = new Date(session.date)
      // Assuming training sessions are 1 hour by default if duration not specified
      const sessionEnd = addDays(sessionDate, session.duration || 60)
      
      if (
        (start >= sessionDate && start < sessionEnd) ||
        (end > sessionDate && end <= sessionEnd) ||
        (start <= sessionDate && end >= sessionEnd)
      ) {
        conflicts.push(session)
      }
    })
  }

  // Check project tasks with dates
  if (context.currentProject) {
    context.currentProject.tasks.forEach(task => {
      if (task.startDate && task.dueDate) {
        const taskStart = new Date(task.startDate)
        const taskEnd = new Date(task.dueDate)
        
        if (
          (start >= taskStart && start < taskEnd) ||
          (end > taskStart && end <= taskEnd) ||
          (start <= taskStart && end >= taskEnd)
        ) {
          conflicts.push(task)
        }
      }
    })
  }

  return conflicts
}

// Find available time slots considering all commitments
function findAvailableSlots(
  date: Date,
  duration: number,
  context: AssistantContext,
  workingHours = { start: 9, end: 17 }
): Date[] {
  const slots: Date[] = []
  const startHour = workingHours.start
  const endHour = workingHours.end
  
  for (let hour = startHour; hour < endHour; hour++) {
    const slotStart = new Date(date)
    slotStart.setHours(hour, 0, 0, 0)
    const slotEnd = new Date(slotStart)
    slotEnd.setMinutes(slotStart.getMinutes() + duration)
    
    if (slotEnd.getHours() > endHour) continue
    
    const conflicts = findConflicts(slotStart, slotEnd, context)
    if (conflicts.length === 0) {
      slots.push(slotStart)
    }
  }
  
  return slots
}

// Generate assistant response
export async function generateResponse(
  message: string,
  context: AssistantContext
): Promise<AssistantResponse> {
  const { command, error } = await parseCommand(message, context)
  
  // Format events and context for the prompt
  const formattedEvents = context.events.map(event => ({
    title: event.summary,
    start: format(parseISO(event.start.dateTime), 'PPpp'),
    end: format(parseISO(event.end.dateTime), 'PPpp'),
    location: event.location,
  }))

  const trainingContext = context.currentTrainingPlan ? {
    plan: context.currentTrainingPlan,
    recentSessions: context.recentTrainingSessions,
    goals: context.trainingGoals,
  } : null

  const projectContext = context.currentProject ? {
    project: context.currentProject,
    recentTasks: context.recentTasks,
    upcomingMilestones: context.upcomingMilestones,
  } : null

  const response = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1000,
    temperature: 0.7,
    system: `${SYSTEM_PROMPT}
      Current timezone: ${context.timezone}
      Current time: ${new Date().toISOString()}
      Calendar events: ${JSON.stringify(formattedEvents)}
      Training context: ${JSON.stringify(trainingContext)}
      Project context: ${JSON.stringify(projectContext)}
      Last command: ${context.lastCommand ? JSON.stringify(context.lastCommand) : 'none'}`,
    messages: [
      {
        role: 'user',
        content: message,
      },
    ],
  })

  try {
    const parsedResponse = JSON.parse(response.content[0].text) as AssistantResponse
    return {
      ...parsedResponse,
      command: error ? undefined : command,
    }
  } catch (error) {
    return {
      message: response.content[0].text,
      command: error ? undefined : command,
    }
  }
}

// Execute calendar commands
export async function executeCommand(
  command: ParsedCommand,
  context: AssistantContext,
  apis: {
    calendar: any
    training?: any
    project?: any
  }
): Promise<{ success: boolean; message: string }> {
  try {
    switch (command.type) {
      // Calendar commands
      case 'create_event':
      case 'update_event':
      case 'delete_event': {
        // ... existing calendar command handling ...
      }

      // Training commands
      case 'create_training_plan': {
        if (!command.trainingPlan) {
          throw new Error('Missing training plan details')
        }
        
        if (apis.training) {
          await apis.training.createPlan(command.trainingPlan)
          return {
            success: true,
            message: 'Training plan created successfully.',
          }
        }
        throw new Error('Training API not available')
      }

      case 'update_training_plan': {
        if (!command.trainingPlan) {
          throw new Error('Missing training plan details')
        }
        
        if (apis.training) {
          await apis.training.updatePlan(command.trainingPlan)
          return {
            success: true,
            message: 'Training plan updated successfully.',
          }
        }
        throw new Error('Training API not available')
      }

      case 'log_training_session': {
        if (!command.trainingSession) {
          throw new Error('Missing training session details')
        }
        
        if (apis.training) {
          await apis.training.logSession(command.trainingSession)
          return {
            success: true,
            message: 'Training session logged successfully.',
          }
        }
        throw new Error('Training API not available')
      }

      // Project commands
      case 'create_project': {
        if (!command.project) {
          throw new Error('Missing project details')
        }
        
        if (apis.project) {
          await apis.project.createProject(command.project)
          return {
            success: true,
            message: 'Project created successfully.',
          }
        }
        throw new Error('Project API not available')
      }

      case 'create_task': {
        if (!command.task || !command.projectId) {
          throw new Error('Missing task details or project ID')
        }
        
        if (apis.project) {
          await apis.project.createTask(command.projectId, command.task)
          return {
            success: true,
            message: 'Task created successfully.',
          }
        }
        throw new Error('Project API not available')
      }

      case 'update_task': {
        if (!command.task || !command.taskId) {
          throw new Error('Missing task details or task ID')
        }
        
        if (apis.project) {
          await apis.project.updateTask(command.taskId, command.task)
          return {
            success: true,
            message: 'Task updated successfully.',
          }
        }
        throw new Error('Project API not available')
      }

      case 'create_milestone': {
        if (!command.milestone || !command.projectId) {
          throw new Error('Missing milestone details or project ID')
        }
        
        if (apis.project) {
          await apis.project.createMilestone(command.projectId, command.milestone)
          return {
            success: true,
            message: 'Milestone created successfully.',
          }
        }
        throw new Error('Project API not available')
      }

      default:
        return {
          success: true,
          message: 'Command processed successfully.',
        }
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to execute command.',
    }
  }
} 