import { CategoriaTransaccion } from '../../core/models/transaccion.model';

/**
 * Utilidades para formatear categorías de transacciones
 */
export class CategoriaUtils {
  
  /**
   * Formatea una categoría con su emoji característico
   */
  static formatearCategoria(categoria: string): string {
    const nombres: { [key: string]: string } = {
      'necesario': '🛍️ Necesario',
      'no_necesario': '🎉 No Necesario', 
      'salario': '💰 Salario',
      'regalo': '🎁 Regalo',
      'otros': '💵 Otros'
    };
    return nombres[categoria] || categoria;
  }

  /**
   * Obtiene solo el emoji de una categoría
   */
  static obtenerEmoji(categoria: string): string {
    const emojis: { [key: string]: string } = {
      'necesario': '🛍️',
      'no_necesario': '🎉',
      'salario': '💰',
      'regalo': '🎁',
      'otros': '💵'
    };
    return emojis[categoria] || '📄';
  }

  /**
   * Obtiene solo el nombre sin emoji de una categoría
   */
  static obtenerNombre(categoria: string): string {
    const nombres: { [key: string]: string } = {
      'necesario': 'Necesario',
      'no_necesario': 'No Necesario',
      'salario': 'Salario',
      'regalo': 'Regalo',
      'otros': 'Otros'
    };
    return nombres[categoria] || categoria;
  }

  /**
   * Obtiene información completa de una categoría
   */
  static obtenerInfoCategoria(categoria: string) {
    return {
      emoji: this.obtenerEmoji(categoria),
      nombre: this.obtenerNombre(categoria),
      completo: this.formatearCategoria(categoria)
    };
  }
}
