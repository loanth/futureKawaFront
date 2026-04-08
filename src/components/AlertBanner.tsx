import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
type BannerStatus = 'nominal' | 'warning' | 'critical';
interface AlertBannerProps {
  status: BannerStatus;
  message: string;
}
export const AlertBanner: React.FC<AlertBannerProps> = ({
  status,
  message
}) => {
  let bgClass = '';
  let textClass = '';
  let Icon = CheckCircle;
  switch (status) {
    case 'nominal':
      bgClass = 'bg-status-success/10 border-status-success/20';
      textClass = 'text-status-success';
      Icon = CheckCircle;
      break;
    case 'warning':
      bgClass = 'bg-status-warning/10 border-status-warning/20';
      textClass = 'text-status-warning';
      Icon = AlertTriangle;
      break;
    case 'critical':
      bgClass = 'bg-status-danger/10 border-status-danger/20';
      textClass = 'text-status-danger';
      Icon = XCircle;
      break;
  }
  return (
    <div className={`flex items-center p-4 rounded-lg border ${bgClass} mb-6`}>
      <Icon className={`w-5 h-5 mr-3 ${textClass}`} />
      <span className={`font-medium ${textClass}`}>{message}</span>
    </div>);

};