export type TimeRange = 'weekly' | 'monthly';

export interface SummaryStats {
  Promedio_Temperatura: number;
  Max_Temperatura: number;
  Min_Temperatura: number;
  Promedio_Humedad: number;
  Max_Humedad: number;
  Min_Humedad: number;
  Promedio_Contaminacion: number;
  Max_Contaminacion: number;
  Min_Contaminacion: number;
  Promedio_Distancia: number;
  Max_Distancia: number;
  Min_Distancia: number;
}

export interface TimeSeriesData {
  timestamp: string;
  Temperatura: number;
  Humedad: number;
  Contaminacion: number;
  Distancia: number;
}