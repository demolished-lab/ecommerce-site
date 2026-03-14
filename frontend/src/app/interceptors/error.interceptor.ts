import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private snackBar: MatSnackBar,
    private router: Router,
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = "An error occurred";

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message;
        } else {
          // Server-side error
          switch (error.status) {
            case 400:
              errorMessage = error.error?.message || "Bad request";
              break;
            case 401:
              errorMessage = "Session expired. Please log in again.";
              this.router.navigate(["/login"]);
              break;
            case 403:
              errorMessage =
                "You do not have permission to perform this action";
              break;
            case 404:
              errorMessage = "Resource not found";
              break;
            case 422:
              errorMessage = "Validation error";
              if (error.error?.errors) {
                const errors = error.error.errors;
                if (Array.isArray(errors)) {
                  errorMessage = errors.map((e: any) => e.message).join(", ");
                }
              }
              break;
            case 429:
              errorMessage = "Too many requests. Please try again later.";
              break;
            case 500:
              errorMessage = "Server error. Please try again later.";
              break;
            default:
              errorMessage = error.error?.message || `Error ${error.status}`;
          }
        }

        // Show error message
        if (error.status !== 401) {
          this.snackBar.open(errorMessage, "Close", {
            duration: 5000,
            horizontalPosition: "end",
            verticalPosition: "top",
            panelClass: ["error-snackbar"],
          });
        }

        return throwError(() => error);
      }),
    );
  }
}

// Standalone interceptor function for Angular 17+
export function errorInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle error in component or show toast
      console.error("HTTP Error:", error);
      return throwError(() => error);
    }),
  );
}

import { HttpHandlerFn } from "@angular/common/http";
