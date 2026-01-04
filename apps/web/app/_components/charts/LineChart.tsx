'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Card, Spin } from 'antd';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LineChartProps {
  title: string;
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }>;
  loading?: boolean;
  yAxisLabel?: string;
}

const defaultColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

export default function LineChartComponent({
  title,
  labels,
  datasets,
  loading = false,
  yAxisLabel = 'Value'
}: LineChartProps) {
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
            weight: 500
          },
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        borderColor: '#ddd',
        borderWidth: 1,
        displayColors: true,
        mode: 'index' as const,
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: yAxisLabel,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 11
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
      delay: (context: { type: string; dataIndex: number }) => {
        let delay = 0;
        if (context.type === 'data') {
          delay = context.dataIndex * 80;
        }
        return delay;
      }
    }
  };

  const chartData = {
    labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      borderColor: dataset.borderColor || defaultColors[index % defaultColors.length],
      backgroundColor: dataset.backgroundColor || `${defaultColors[index % defaultColors.length]}20`,
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: dataset.borderColor || defaultColors[index % defaultColors.length],
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverRadius: 6,
      hoverBorderWidth: 3
    }))
  };

  return (
    <Card title={title} style={{ width: '100%' }}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <Spin />
        </div>
      ) : (
        <div style={{ position: 'relative', height: 300, width: '100%' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </Card>
  );
}
