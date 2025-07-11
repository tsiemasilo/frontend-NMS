import { Badge } from "@/components/ui/badge";

interface HealthScoreBadgeProps {
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function HealthScoreBadge({ score, size = 'md', showLabel = true }: HealthScoreBadgeProps) {
  if (typeof score !== 'number') {
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
        {showLabel && 'Health: '}N/A
      </Badge>
    );
  }

  const getHealthScoreColor = (score: number): string => {
    if (score >= 90) return 'bg-green-50 text-green-700 border-green-200';
    if (score >= 75) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (score >= 60) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    if (score >= 40) return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  const getHealthScoreDescription = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Critical';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <Badge 
      variant="outline" 
      className={`${getHealthScoreColor(score)} ${sizeClasses[size]} font-medium`}
      title={`Network Health: ${score}/100 (${getHealthScoreDescription(score)})`}
    >
      {showLabel && 'Health: '}{score}
      <span className="ml-1 opacity-75">
        {score >= 90 ? '●' : score >= 75 ? '●' : score >= 60 ? '●' : score >= 40 ? '●' : '●'}
      </span>
    </Badge>
  );
}