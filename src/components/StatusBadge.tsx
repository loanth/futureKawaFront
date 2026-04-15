import React from 'react';
type StatusType = 'conforme' | 'en alerte' | 'périmé' | 'traitée' | 'en cours';
interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = ''
}) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  
  if (!status) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor} ${className}`}>
        Inconnu
      </span>
    );
  }
  
  const normalizedStatus = status.toLowerCase();
  if (normalizedStatus === 'conforme' || normalizedStatus === 'traitée') {
    bgColor = 'bg-status-success/10';
    textColor = 'text-status-success';
  } else if (
  normalizedStatus === 'en alerte' ||
  normalizedStatus === 'en cours')
  {
    bgColor = 'bg-status-warning/10';
    textColor = 'text-status-warning';
  } else if (normalizedStatus === 'périmé') {
    bgColor = 'bg-status-danger/10';
    textColor = 'text-status-danger';
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor} ${className}`}>
      
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>);

};