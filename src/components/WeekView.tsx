import { format, addDays, isSameDay } from 'date-fns'

interface WeekViewProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

export default function WeekView({ selectedDate, onDateSelect }: WeekViewProps) {
  // Generate array of 7 days starting from current week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i - new Date().getDay())
    return date
  })

  return (
    <div className="overflow-x-auto safe-left safe-right -mx-4 px-4">
      <div className="flex gap-2 py-2 min-w-max">
        {weekDays.map((date) => {
          const isSelected = isSameDay(date, selectedDate)
          const isToday = isSameDay(date, new Date())
          
          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateSelect(date)}
              className={`flex flex-col items-center min-w-[3rem] py-2 px-1 rounded-xl transition-colors
                ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 active:bg-gray-200'}
                ${isToday && !isSelected ? 'text-blue-500' : ''}
              `}
            >
              <span className="text-xs font-medium uppercase">
                {format(date, 'EEE')}
              </span>
              <span className={`text-lg mt-1 font-medium ${isToday && !isSelected ? 'text-blue-500' : ''}`}>
                {format(date, 'd')}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
} 