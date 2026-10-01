import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * One figure, one label. The icon is a quiet marker in the corner rather than a
 * coloured badge — a green/red/purple tile per metric is how a dashboard starts
 * to look like a toy. The number is the message.
 */
const DashboardCard = ({ icon, label, value, trend }) => {
  const isPositive = trend && trend.startsWith('+');

  return (
    <div
      className="card card-pad h-full"
      data-testid={`dashboard-card-${label.toLowerCase().replace(/ /g, '-')}`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-ink-faint">{icon}</span>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-teal' : 'text-red'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label mt-1.5">{label}</div>
    </div>
  );
};

export default DashboardCard;
