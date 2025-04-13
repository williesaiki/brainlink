import { useState } from "react";
import { Activity, ArrowUpRight, Plus, Target, CheckCircle2, Building2, Users2, Shield } from 'lucide-react';
import { cn } from "@/lib/utils";
import EventForm from "../platform/EventForm";

export interface Metric {
  label: string;
  value: string;
  trend: number;
  unit?: string;
}

export interface Goal {
  id: string;
  title: string;
  isCompleted: boolean;
  category?: 'client' | 'offer' | 'meeting' | 'other';
}

interface ActivityCardProps {
  category?: string;
  title?: string;
  metrics?: Metric[];
  dailyGoals?: Goal[];
  onToggleGoal?: (goalId: string) => void;
  onViewDetails?: () => void;
  onTaskClick?: (goalId: string) => void;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function ActivityCard({
  category = "Aktywność",
  title = "Lista zadań",
  metrics = [],
  dailyGoals = [],
  onToggleGoal,
  onViewDetails,
  onTaskClick,
  className,
  isOpen,
  onClose
}: ActivityCardProps) {
  const [showEventForm, setShowEventForm] = useState(false);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-screen w-96 z-50 transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full",
          "relative rounded-l-3xl p-6",
          "bg-[#000008] dark:bg-[#000008]",
          "border-l border-[#E5E5E5]/10",
          className
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#010220] transition-colors text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-[#010220]">
              <Building2 className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {title}
              </h3>
              <p className="text-sm text-gray-400">
                {category}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowEventForm(true)}
            className="bg-[#010220] hover:bg-[#010220]/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Dodaj
          </button>
        </div>

        {/* Metrics */}
        {metrics.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <div
                key={metric.label}
                className="relative flex flex-col items-center"
                onMouseEnter={() => setIsHovering(metric.label)}
                onMouseLeave={() => setIsHovering(null)}
              >
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-[#010220]" />
                  <div
                    className={cn(
                      "absolute inset-0 rounded-full border-4 transition-all duration-500",
                      isHovering === metric.label && "scale-105"
                    )}
                    style={{
                      borderColor: METRIC_COLORS[metric.label as keyof typeof METRIC_COLORS] || "#6069FF",
                      clipPath: `polygon(0 0, 100% 0, 100% ${metric.trend}%, 0 ${metric.trend}%)`,
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {metric.value}
                    </span>
                    <span className="text-xs text-gray-400">
                      {metric.unit}
                    </span>
                  </div>
                </div>
                <span className="mt-3 text-sm font-medium text-gray-300">
                  {metric.label}
                </span>
                <span className="text-xs text-gray-400">
                  {metric.trend}%
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tasks Section */}
        <div className="mt-8 space-y-6">
          <div className="h-px bg-gradient-to-r from-transparent via-[#E5E5E5]/10 to-transparent" />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-400" />
              <h4 className="text-sm font-medium text-gray-300">Zadania</h4>
            </div>

            <div className="space-y-2">
              {dailyGoals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => onTaskClick?.(goal.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl",
                    "bg-[#010220]",
                    "border border-[#E5E5E5]/10",
                    "hover:border-[#E5E5E5]/20",
                    "transition-all"
                  )}
                >
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleGoal?.(goal.id);
                    }}
                    className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                      goal.isCompleted ? "bg-blue-500 border-blue-500" : "border-gray-600"
                    )}
                  >
                    {goal.isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <span className={cn(
                    "flex-1 text-left",
                    goal.isCompleted ? "text-gray-400 line-through" : "text-gray-300"
                  )}>
                    {goal.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E5E5]/10">
            <button
              onClick={onViewDetails}
              className="inline-flex items-center gap-2 text-sm font-medium
                text-gray-400 hover:text-white
                transition-colors duration-200"
            >
              Zobacz wszystkie zadania
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <EventForm onClose={() => setShowEventForm(false)} />
      )}
    </>
  );
}