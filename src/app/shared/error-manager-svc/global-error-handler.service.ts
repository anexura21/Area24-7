import { Injectable, ErrorHandler } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandlerService extends ErrorHandler {

  constructor() {
    super();
  }

  handleError(error: any): void {
    super.handleError(error);
  }
}
