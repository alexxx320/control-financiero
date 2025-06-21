// Archivo de corrección temporal para reportes.service.ts
// Reemplaza las líneas que usan moment() con estas funciones

// En lugar de: moment().month(mes - 1).year(año).format('MMMM YYYY')
function formatearMesAño(mes: number, año: number): string {
  const fecha = new Date(año, mes - 1, 1);
  return fecha.toLocaleDateString('es-ES', { 
    month: 'long', 
    year: 'numeric' 
  });
}

// En lugar de: moment().month(mes - 1).format('MMMM')
function formatearMes(mes: number): string {
  const fecha = new Date(2023, mes - 1, 1);
  return fecha.toLocaleDateString('es-ES', { 
    month: 'long' 
  });
}

// Ejemplo de uso:
// periodo: formatearMesAño(mes, año),
// nombreMes: formatearMes(mes),
