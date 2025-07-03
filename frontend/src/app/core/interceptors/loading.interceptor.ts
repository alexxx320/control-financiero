import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private pendingRequests = 0;

  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // No mostrar loading para ciertos endpoints
    if (this.shouldShowLoading(request)) {
      this.pendingRequests++;
      this.loadingService.setLoading(true);
    }

    return next.handle(request).pipe(
      finalize(() => {
        if (this.shouldShowLoading(request)) {
          this.pendingRequests--;
          if (this.pendingRequests === 0) {
            this.loadingService.setLoading(false);
          }
        }
      })
    );
  }

  private shouldShowLoading(request: HttpRequest<any>): boolean {
    // No mostrar loading para requests de verificación o rápidos
    const silentEndpoints = ['/auth/refresh', '/auth/verify', '/health'];
    return !silentEndpoints.some(endpoint => request.url.includes(endpoint));
  }
}
