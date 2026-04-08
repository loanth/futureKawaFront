import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  colorClass?: string;
}
export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  colorClass = 'text-coffee-dark'
}) => {
  return (
    <motion.div
      whileHover={{
        y: -4
      }}
      className="bg-cream-card rounded-xl p-6 shadow-card border border-coffee-light/10">
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-coffee-medium mb-1">{title}</p>
          <h3 className={`text-2xl font-bold ${colorClass}`}>{value}</h3>
        </div>
        <div className={`p-3 rounded-lg bg-cream-bg ${colorClass}`}>
          <Icon size={24} />
        </div>
      </div>

      {trend &&
      <div className="mt-4 flex items-center text-sm">
          <span
          className={`font-medium ${trend.isPositive ? 'text-status-success' : 'text-status-danger'}`}>
          
            {trend.isPositive ? '+' : '-'}
            {Math.abs(trend.value)}%
          </span>
          <span className="text-coffee-light ml-2">depuis le mois dernier</span>
        </div>
      }
    </motion.div>);

};