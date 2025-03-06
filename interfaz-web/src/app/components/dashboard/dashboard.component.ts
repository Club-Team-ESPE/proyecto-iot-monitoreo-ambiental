import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { SummaryStats, TimeSeriesData, TimeRange } from '../../models/stats.model';
import { StatsCardComponent } from '../stats-card/stats-card.component';
import { ChartComponent } from '../chart/chart.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule,
    FormsModule,
    StatsCardComponent,
    ChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit{
  summaryStats: SummaryStats | null = null;
  timeSeriesData: TimeSeriesData[] = [];
  selectedTimeRange: TimeRange = 'weekly';
  loading = true;
  error = false;
  
  chartTypes = [
    { id: 'line', name: 'Líneas' },
    { id: 'bar', name: 'Barras' }
  ];
  
  selectedChartType: 'line' | 'bar' = 'line';
  
  constructor(private apiService: ApiService) {}
  
  ngOnInit(): void {
    this.fetchData();
  }
  
  fetchData(): void {
    this.loading = true;
    this.error = false;
    
    // Obtenemos los datos de resumen
    this.apiService.getSummaryStats(this.selectedTimeRange).subscribe({
      next: (data) => {
        console.log('Received summary stats:', data);
        this.summaryStats = data;
      },
      error: (err) => {
        console.error('Error fetching summary stats:', err);
        // Mostrar detalles adicionales del error
        console.error('Status:', err.status);
        console.error('Status Text:', err.statusText);
        console.error('URL:', err.url);
        if (err.error) {
          console.error('Error body:', err.error);
        }
        this.error = true;
      }
    });
    
    // Obtenemos los datos de series temporales
    this.apiService.getTimeSeriesData(this.selectedTimeRange).subscribe({
      next: (data) => {
        console.log('Received time series data:', data);
        this.timeSeriesData = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching time series data:', err);
        // Mostrar detalles adicionales del error
        console.error('Status:', err.status);
        console.error('Status Text:', err.statusText);
        console.error('URL:', err.url);
        if (err.error) {
          console.error('Error body:', err.error);
        }
        this.error = true;
        this.loading = false;
      }
    });
  }
  
  onTimeRangeChange(): void {
    this.fetchData();
  }
  
  onChartTypeChange(): void {
    // No hace falta recargar datos, solo cambia el tipo de gráfico
  }
}
