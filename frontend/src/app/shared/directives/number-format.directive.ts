import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appNumberFormat]',
  standalone: true
})
export class NumberFormatDirective {
  private previousValue: string = '';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private control: NgControl
  ) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remover todo excepto números
    const numericValue = value.replace(/[^\d]/g, '');
    
    if (numericValue !== '') {
      // Formatear con separadores de miles
      const formattedValue = this.formatNumber(parseInt(numericValue, 10));
      
      // Actualizar el valor visual
      this.renderer.setProperty(this.el.nativeElement, 'value', formattedValue);
      
      // Actualizar el control del formulario con el valor numérico
      if (this.control && this.control.control) {
        this.control.control.setValue(parseInt(numericValue, 10), { emitEvent: false });
      }
      
      this.previousValue = formattedValue;
    } else {
      // Si está vacío, limpiar todo
      this.renderer.setProperty(this.el.nativeElement, 'value', '');
      if (this.control && this.control.control) {
        this.control.control.setValue(null, { emitEvent: false });
      }
      this.previousValue = '';
    }
  }

  @HostListener('focus', ['$event'])
  onFocus(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Al hacer foco, mostrar solo números para facilitar edición
    if (this.control && this.control.control && this.control.control.value) {
      this.renderer.setProperty(this.el.nativeElement, 'value', this.control.control.value.toString());
    }
  }

  @HostListener('blur', ['$event'])
  onBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Al perder foco, formatear con separadores
    if (this.control && this.control.control && this.control.control.value) {
      const formattedValue = this.formatNumber(this.control.control.value);
      this.renderer.setProperty(this.el.nativeElement, 'value', formattedValue);
    }
  }

  private formatNumber(num: number): string {
    // Formatear número con separadores de miles para Colombia
    return new Intl.NumberFormat('es-CO').format(num);
  }
}
