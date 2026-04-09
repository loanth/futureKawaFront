import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler } from
'chart.js';
import { Line } from 'react-chartjs-2';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
interface HumidityChartProps {
  data: {
    date: string;
    value: number | null;
  }[];
  minThreshold?: number;
  maxThreshold?: number;
  title?: string;
}
export const HumidityChart: React.FC<HumidityChartProps> = ({
  data,
  minThreshold,
  maxThreshold,
  title = "Évolution de l'humidité (%)"
}) => {
  const labels = data.map((d) => {
    const date = new Date(d.date);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    });
  });
  const datasets: any[] = [
  {
    label: 'Humidité (%)',
    data: data.map((d) => d.value),
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 2,
    pointRadius: 1,
    pointHoverRadius: 4,
    fill: true,
    tension: 0.4
  }];

  if (minThreshold !== undefined) {
    datasets.push({
      label: `Min (${minThreshold}%)`,
      data: data.map(() => minThreshold),
      borderColor: '#ef4444',
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderDash: [5, 5],
      pointRadius: 0,
      pointHoverRadius: 0,
      fill: false,
      tension: 0
    });
  }
  if (maxThreshold !== undefined) {
    datasets.push({
      label: `Max (${maxThreshold}%)`,
      data: data.map(() => maxThreshold),
      borderColor: '#ef4444',
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderDash: [5, 5],
      pointRadius: 0,
      pointHoverRadius: 0,
      fill: false,
      tension: 0
    });
  }
  const chartData = {
    labels,
    datasets
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        color: '#2C1810',
        font: {
          family: "'DM Sans', sans-serif",
          size: 14,
          weight: 'bold' as const
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false
      }
    },
    scales: {
      y: {
        suggestedMin: minThreshold ? minThreshold - 5 : 40,
        suggestedMax: maxThreshold ? maxThreshold + 5 : 100,
        grid: {
          color: 'rgba(44, 24, 16, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxTicksLimit: 10
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };
  return (
    <div className="w-full h-64 bg-white p-4 rounded-xl shadow-card border border-coffee-light/10">
      <Line data={chartData} options={options} />
    </div>);

};