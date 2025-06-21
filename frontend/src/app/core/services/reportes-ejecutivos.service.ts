import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportesEjecutivosService {
  private readonly baseUrl = `${environment.apiUrl}/reportes/ejecutivos`;

  constructor(private http: HttpClient) {}

  obtenerDashboardData(periodo: string = 'mes'): Observable<any> {
    const params = new HttpParams().set('periodo', periodo);
    console.log('🌐 Llamando a:', `${this.baseUrl}/dashboard?periodo=${periodo}`);
    return this.http.get(`${this.baseUrl}/dashboard`, { params });
  }

  obtenerKPIs(periodo: string = 'mes'): Observable<any> {
    const params = new HttpParams().set('periodo', periodo);
    return this.http.get(`${this.baseUrl}/kpis`, { params });
  }

  obtenerDatosGraficos(periodo: string = 'mes', tipo: string = 'tendencia'): Observable<any> {
    const params = new HttpParams()
      .set('periodo', periodo)
      .set('tipo', tipo);
    return this.http.get(`${this.baseUrl}/graficos`, { params });
  }

  async exportarPDF(periodo: string = 'mes'): Promise<void> {
    const body = { periodo };
    
    try {
      this.http.post(`${this.baseUrl}/exportar/pdf`, body, {
        responseType: 'blob'
      }).subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte-ejecutivo-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      throw error;
    }
  }

  async exportarExcel(periodo: string = 'mes'): Promise<void> {
    const body = { periodo };
    
    try {
      this.http.post(`${this.baseUrl}/exportar/excel`, body, {
        responseType: 'blob'
      }).subscribe(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte-ejecutivo-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      throw error;
    }
  }

  // Método de prueba
  test(): Observable<any> {
    return this.http.get(`${this.baseUrl}/test`);
  }
}
