import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportData {
  title: string;
  data: any[];
  columns?: string[];
  fileName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() {}

  /**
   * Exportar datos a Excel
   */
  async exportToExcel(exportData: ExportData): Promise<void> {
    try {
      console.log('📊 Exportando a Excel:', exportData.title);

      // Crear un nuevo workbook
      const workbook = XLSX.utils.book_new();
      
      // Convertir datos a worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData.data);
      
      // Agregar el worksheet al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
      
      // Generar el archivo
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      });
      
      // Crear blob y descargar
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const fileName = exportData.fileName || `${exportData.title}_${this.getCurrentDateString()}.xlsx`;
      saveAs(blob, fileName);
      
      console.log('✅ Archivo Excel generado exitosamente');
    } catch (error) {
      console.error('❌ Error al exportar a Excel:', error);
      throw error;
    }
  }

  /**
   * Exportar elemento HTML a PDF
   */
  async exportElementToPDF(element: HTMLElement, fileName?: string): Promise<void> {
    try {
      console.log('📄 Exportando elemento a PDF...');

      // Configuración de html2canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Mayor calidad
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Obtener dimensiones
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Crear PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Agregar la primera página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Agregar páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Descargar el PDF
      const pdfFileName = fileName || `reporte_${this.getCurrentDateString()}.pdf`;
      pdf.save(pdfFileName);
      
      console.log('✅ PDF generado exitosamente');
    } catch (error) {
      console.error('❌ Error al exportar a PDF:', error);
      throw error;
    }
  }

  /**
   * Exportar reporte completo a PDF con gráficos
   */
  async exportReportToPDF(reportData: any, charts: HTMLElement[], fileName?: string): Promise<void> {
    try {
      console.log('📊 Exportando reporte completo a PDF...');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 295;
      let currentY = 20;

      // Título principal
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Reporte Financiero', pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      // Fecha del reporte
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const fecha = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      pdf.text(`Fecha: ${fecha}`, pageWidth / 2, currentY, { align: 'center' });
      currentY += 20;

      // Resumen de datos
      if (reportData.resumen) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Resumen Ejecutivo', 20, currentY);
        currentY += 10;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        
        const resumen = reportData.resumen;
        const resumenTexto = [
          `Total Ingresos: ${this.formatCurrency(resumen.totalIngresos)}`,
          `Total Gastos: ${this.formatCurrency(resumen.totalGastos)}`,
          `Balance Neto: ${this.formatCurrency(resumen.balanceNeto)}`,
          `Total Transacciones: ${resumen.transaccionesTotales || 0}`
        ];

        resumenTexto.forEach(texto => {
          pdf.text(texto, 25, currentY);
          currentY += 8;
        });
        currentY += 10;
      }

      // Agregar gráficos
      for (let i = 0; i < charts.length; i++) {
        const chart = charts[i];
        
        // Verificar si hay espacio en la página
        if (currentY > 200) {
          pdf.addPage();
          currentY = 20;
        }

        try {
          const canvas = await html2canvas(chart, {
            scale: 1.5,
            backgroundColor: '#ffffff',
            logging: false
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 170;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          pdf.addImage(imgData, 'PNG', 20, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 15;
        } catch (error) {
          console.warn(`Error al procesar gráfico ${i + 1}:`, error);
        }
      }

      // Pie de página
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Descargar
      const pdfFileName = fileName || `reporte_completo_${this.getCurrentDateString()}.pdf`;
      pdf.save(pdfFileName);
      
      console.log('✅ Reporte PDF completo generado exitosamente');
    } catch (error) {
      console.error('❌ Error al exportar reporte a PDF:', error);
      throw error;
    }
  }

  /**
   * Exportar datos de tabla a CSV
   */
  exportToCSV(exportData: ExportData): void {
    try {
      console.log('📄 Exportando a CSV:', exportData.title);

      // Convertir datos a CSV
      const csvContent = this.convertToCSV(exportData.data, exportData.columns);
      
      // Crear blob y descargar
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const fileName = exportData.fileName || `${exportData.title}_${this.getCurrentDateString()}.csv`;
      
      saveAs(blob, fileName);
      console.log('✅ Archivo CSV generado exitosamente');
    } catch (error) {
      console.error('❌ Error al exportar a CSV:', error);
      throw error;
    }
  }

  /**
   * Convertir datos a formato CSV
   */
  private convertToCSV(data: any[], columns?: string[]): string {
    if (!data || data.length === 0) {
      return '';
    }

    const keys = columns || Object.keys(data[0]);
    const csvArray = [];
    
    // Agregar encabezados
    csvArray.push(keys.join(','));
    
    // Agregar filas de datos
    data.forEach(row => {
      const values = keys.map(key => {
        const value = row[key];
        // Escapar comillas y agregar comillas si contiene comas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvArray.push(values.join(','));
    });

    return csvArray.join('\n');
  }

  /**
   * Formatear moneda
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  /**
   * Obtener fecha actual como string
   */
  private getCurrentDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0].replace(/-/g, '');
  }

  /**
   * Obtener tipos de exportación disponibles
   */
  getAvailableFormats(): Array<{value: string, label: string, icon: string}> {
    return [
      { value: 'pdf', label: 'PDF', icon: 'picture_as_pdf' },
      { value: 'excel', label: 'Excel', icon: 'table_chart' },
      { value: 'csv', label: 'CSV', icon: 'description' }
    ];
  }
}
