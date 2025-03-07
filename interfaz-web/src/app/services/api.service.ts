import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SummaryStats, TimeSeriesData, TimeRange } from '../models/stats.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  private readonly baseUrl = 'https://y3qfcs9pqh.execute-api.us-east-2.amazonaws.com';
  
  constructor(private http: HttpClient) {}
  
  getSummaryStats(timeRange: TimeRange): Observable<SummaryStats> {
    // Asegúrate de que el parámetro sea time_range (con guión bajo)
    return this.http.get<SummaryStats>(`${this.baseUrl}/allStats?time_range=${timeRange}`);
  }
    
  getTimeSeriesData(timeRange: TimeRange): Observable<TimeSeriesData[]> {
    return this.http.get<any>(`${this.baseUrl}/getListStatsSensorData?time_range=${timeRange}`)
      .pipe(
        map(response => {
          if (response && 
               Array.isArray(response.Temperaturas) &&
               Array.isArray(response.Humedades) &&
               Array.isArray(response.Contaminaciones) &&
               Array.isArray(response.Distancias)) {
                         
            const maxLength = Math.max(
              response.Temperaturas.length,
              response.Humedades.length,
              response.Contaminaciones.length,
              response.Distancias.length
            );
                         
            const result = [];
                         
            for (let i = 0; i < maxLength; i++) {
              const temp = response.Temperaturas[i] || {};
              const hum = response.Humedades[i] || {};
              const cont = response.Contaminaciones[i] || {};
              const dist = response.Distancias[i] || {};
                             
              const fechaHora = temp.FechaHora || hum.FechaHora || cont.FechaHora || dist.FechaHora || new Date().toISOString();
                             
              // Convertimos a número y usamos 0 como fallback en lugar de null
              const tempValor = temp.Valor ? parseFloat(temp.Valor) : 0;
              const humValor = hum.Valor ? parseFloat(hum.Valor) : 0;
              const contValor = cont.Valor ? parseFloat(cont.Valor) : 0;
              const distValor = dist.Valor ? parseFloat(dist.Valor) : 0;
                             
              result.push({
                timestamp: fechaHora,
                Temperatura: tempValor,
                Humedad: humValor,
                Contaminacion: contValor,
                Distancia: distValor
              });
            }
                         
            return result as TimeSeriesData[];
          }
                     
          console.error('Formato de respuesta no compatible', response);
          return [] as TimeSeriesData[];
        })
      );
  }
}