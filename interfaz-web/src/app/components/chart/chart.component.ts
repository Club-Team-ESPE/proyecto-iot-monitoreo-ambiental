import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { TimeSeriesData } from '../../models/stats.model';
import { CommonModule, NgClass } from '@angular/common';
import 'chartjs-adapter-date-fns';

@Component({
  selector: 'app-chart',
  imports: [NgChartsModule, CommonModule, NgClass],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})
export class ChartComponent implements OnChanges{
  @Input() color: string = 'primary'; // O el color predeterminado
  @Input() icon: string = 'fa-chart-bar'; // Ícono de FontAwesome por defecto
  @Input() average: number = 0; // Valor inicial
  @Input() max: number = 0; // Valor inicial
  @Input() min: number = 0; // Valor inicial
  @Input() timeSeriesData: TimeSeriesData[] = [];
  @Input() title: string = '';
  @Input() chartType: 'line' | 'bar' = 'line';
  @Input() dataType: 'Temperatura' | 'Humedad' | 'Contaminacion' = 'Temperatura';
  
  chartData: ChartData<'line' | 'bar'> = {
    labels: [],
    datasets: []
  };
  
  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: this.title
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['timeSeriesData'] || changes['dataType']) {
      this.updateChartData();
    }
    
    if (changes['title']) {
      this.chartOptions = {
        ...this.chartOptions,
        plugins: {
          ...this.chartOptions.plugins,
          title: {
            ...this.chartOptions.plugins?.title,
            text: this.title
          }
        }
      };
    }
  }
  
  private updateChartData(): void {
    if (!this.timeSeriesData || this.timeSeriesData.length === 0) {
      return;
    }
    
    console.log('Datos para la gráfica:', this.timeSeriesData);
  
  // Convertir las fechas a objetos Date
  const labels = this.timeSeriesData.map(item => {
    if (item.timestamp) {
      // La fecha viene en formato "2025-03-05 23:47:27"
      return new Date(item.timestamp);
    } else {
      // Fallback por si no hay timestamp
      return new Date();
    }
  });
  
  // Verificar si hay fechas inválidas
  if (labels.some(date => isNaN(date.getTime()))) {
    console.warn('Hay fechas inválidas en los datos');
    console.log('Ejemplos de fechas problemáticas:', 
      this.timeSeriesData.filter(item => isNaN(new Date(item.timestamp).getTime()))
        .map(item => item.timestamp));
  }
    
    const data = this.timeSeriesData.map(item => item[this.dataType]);
    
    // Actualizar estadísticas si no se proporcionan externamente
    if (this.average === 0) {
      const sum = data.reduce((acc, val) => acc + val, 0);
      this.average = sum / data.length;
    }
    
    if (this.max === 0) {
      this.max = Math.max(...data);
    }
    
    if (this.min === 0) {
      this.min = Math.min(...data);
    }
    
    let backgroundColor = 'rgba(54, 162, 235, 0.2)';
    let borderColor = 'rgba(54, 162, 235, 1)';
    
    if (this.dataType === 'Temperatura') {
      backgroundColor = 'rgba(255, 99, 132, 0.2)';
      borderColor = 'rgba(255, 99, 132, 1)';
    } else if (this.dataType === 'Humedad') {
      backgroundColor = 'rgba(75, 192, 192, 0.2)';
      borderColor = 'rgba(75, 192, 192, 1)';
    }
    
    this.chartData = {
      labels,
      datasets: [
        {
          label: this.dataType,
          data,
          backgroundColor,
          borderColor,
          borderWidth: 1,
          tension: 0.1
        }
      ]
    };

    this.chartOptions = {
      ...this.chartOptions,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'hour',
            displayFormats: {
              hour: 'HH:mm'
            },
            tooltipFormat: 'yyyy-MM-dd HH:mm'
          },
          title: {
            display: true,
            text: 'Fecha y Hora'
          }
        },
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: this.dataType
          }
        }
      }
    };
  }
}
