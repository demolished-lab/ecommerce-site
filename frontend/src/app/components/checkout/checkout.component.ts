import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, 
    MatButtonModule, MatRadioModule, MatIconModule, MatSnackBarModule, 
    MatProgressSpinnerModule, MatDividerModule
  ],
  template: `
    <div class="checkout-page">
      <div class="checkout-header">
        <h1>Secure Checkout</h1>
        <p>Complete your purchase securely below.</p>
      </div>

      <div class="checkout-layout">
        
        <!-- LEFT COLUMN: Forms -->
        <div class="checkout-main">
          <form [formGroup]="checkoutForm" (ngSubmit)="submit()">
            
            <!-- Shipping Section -->
            <section class="checkout-section">
              <div class="section-header">
                <mat-icon>local_shipping</mat-icon>
                <h2>Shipping Address</h2>
              </div>
              
              <div class="form-grid">
                <mat-form-field appearance="outline" class="full-width col-span-2">
                  <mat-label>Full Name</mat-label>
                  <input matInput formControlName="fullName" required placeholder="John Doe" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width col-span-2">
                  <mat-label>Street Address</mat-label>
                  <input matInput formControlName="address" required placeholder="123 Main St, Apt 4B" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>City</mat-label>
                  <input matInput formControlName="city" required placeholder="New York" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>State / Province</mat-label>
                  <input matInput formControlName="state" required placeholder="NY" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Postal Code</mat-label>
                  <input matInput formControlName="postalCode" required placeholder="10001" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Country</mat-label>
                  <input matInput formControlName="country" required placeholder="USA" />
                </mat-form-field>
              </div>
            </section>

            <!-- Payment Section -->
            <section class="checkout-section payment-section">
              <div class="section-header">
                <mat-icon>payment</mat-icon>
                <h2>Payment Method</h2>
              </div>

              <mat-radio-group formControlName="paymentMethod" class="payment-options">
                <mat-radio-button value="credit_card" class="payment-option" [checked]="true">
                  <div class="payment-label">
                    <mat-icon>credit_card</mat-icon>
                    <span>Credit or Debit Card</span>
                  </div>
                </mat-radio-button>
                
                <!-- Credit Card Form (Visible when CC selected) -->
                <div class="cc-form" *ngIf="checkoutForm.get('paymentMethod')?.value === 'credit_card'">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Card Number</mat-label>
                    <input matInput placeholder="0000 0000 0000 0000" formControlName="cardNumber" maxlength="19" />
                    <mat-icon matSuffix class="cc-icon">credit_score</mat-icon>
                  </mat-form-field>
                  
                  <div class="form-grid">
                     <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Expiration (MM/YY)</mat-label>
                      <input matInput placeholder="MM/YY" formControlName="cardExpiry" maxlength="5" />
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>CVC</mat-label>
                      <input matInput placeholder="123" formControlName="cardCvc" maxlength="4" />
                    </mat-form-field>
                  </div>
                </div>

                <mat-radio-button value="paypal" class="payment-option">
                  <div class="payment-label">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" style="margin-right: 8px; color: #00457C;"><path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.232 1.48a.804.804 0 0 1-.794.68H7.405a.201.201 0 0 1-.198-.233L9.5 5.86a.804.804 0 0 1 .794-.68h4.942c1.928 0 3.336.25 4.316 1.058.465.385.803.923 .515 2.24z"/></svg>
                    <span>PayPal</span>
                  </div>
                </mat-radio-button>
              </mat-radio-group>
            </section>
            
            <button mat-flat-button color="primary" type="submit" class="submit-btn" [disabled]="checkoutForm.invalid || isSubmitting || !cart?.items?.length">
              <mat-spinner diameter="24" *ngIf="isSubmitting"></mat-spinner>
              <span *ngIf="!isSubmitting">Complete Order • \${{ cart?.total | number:'1.2-2' }}</span>
            </button>
          </form>
        </div>
        
        <!-- RIGHT COLUMN: Order Summary -->
        <div class="checkout-sidebar">
          <div class="summary-card">
            <h2>Order Summary</h2>
            
            <div class="cart-items">
              <div class="empty-cart" *ngIf="!cart?.items?.length">
                Your cart is empty.
              </div>
              <div class="cart-item" *ngFor="let item of cart?.items">
                <div class="item-details">
                  <span class="item-name">{{ item.product_name }}</span>
                  <span class="item-qty">Qty: {{ item.quantity }}</span>
                </div>
                <div class="item-price">\${{ item.total_price | number:'1.2-2' }}</div>
              </div>
            </div>

            <mat-divider style="margin: 16px 0;"></mat-divider>

            <div class="summary-rows">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>\${{ cart?.subtotal | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <span>\${{ cart?.shipping_estimate | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Estimated Tax</span>
                <span>\${{ cart?.tax_amount | number:'1.2-2' }}</span>
              </div>
              
              <mat-divider style="margin: 12px 0;"></mat-divider>
              
              <div class="summary-row total">
                <span>Total</span>
                <span>\${{ cart?.total | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
          
          <div class="secure-badge">
             <mat-icon>lock</mat-icon>
             <span>256-bit SSL Secure Checkout</span>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .checkout-page {
      padding: 40px 24px 80px;
      max-width: 1100px;
      margin: 0 auto;
      background: #fcfcfc;
      min-height: 80vh;
    }
    
    .checkout-header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .checkout-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 8px 0;
    }
    
    .checkout-header p {
      color: #64748b;
      margin: 0;
      font-size: 16px;
    }

    .checkout-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 32px;
      align-items: start;
    }

    @media (max-width: 860px) {
      .checkout-layout {
        grid-template-columns: 1fr;
        flex-direction: column-reverse;
      }
      .checkout-main { order: 2; }
      .checkout-sidebar { order: 1; }
    }

    /* Form Sections */
    .checkout-section {
      background: #ffffff;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.03);
      border: 1px solid #e2e8f0;
      margin-bottom: 24px;
    }

    .section-header {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f1f5f9;
    }
    
    .section-header mat-icon {
      color: #3f51b5;
      margin-right: 12px;
    }
    
    .section-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #0f172a;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 16px;
    }
    
    .col-span-2 {
      grid-column: span 2;
    }

    .full-width {
      width: 100%;
    }

    /* Payment Specifics */
    .payment-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .payment-option {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px 16px;
      background: #f8fafc;
      transition: all 0.2s ease;
    }

    ::ng-deep .mat-mdc-radio-checked.payment-option {
      border-color: #3f51b5;
      background: #eef2ff;
    }

    .payment-label {
      display: flex;
      align-items: center;
      font-weight: 500;
      color: #334155;
    }
    
    .payment-label mat-icon {
      margin-right: 8px;
      color: #64748b;
    }

    .cc-form {
      margin-top: 16px;
      padding: 16px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }

    .cc-icon {
      color: #94a3b8;
    }

    .submit-btn {
      width: 100%;
      height: 54px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      margin-top: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #1e293b;
    }
    
    /* Order Summary Sidebar */
    .summary-card {
      background: #ffffff;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
      position: sticky;
      top: 24px;
    }

    .summary-card h2 {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 20px 0;
    }

    .cart-items {
      max-height: 300px;
      overflow-y: auto;
      margin-bottom: 16px;
    }

    .cart-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .item-details {
      display: flex;
      flex-direction: column;
      padding-right: 12px;
    }

    .item-name {
      font-weight: 500;
      color: #334155;
      font-size: 14px;
      line-height: 1.4;
      margin-bottom: 4px;
    }

    .item-qty {
      font-size: 13px;
      color: #64748b;
    }

    .item-price {
      font-weight: 600;
      color: #0f172a;
    }

    .summary-rows {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      color: #475569;
      font-size: 14px;
    }

    .summary-row.total {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
    }

    .secure-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      font-size: 13px;
      margin-top: 20px;
    }
    
    .secure-badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 6px;
      color: #10b981;
    }
  `]
})
export class CheckoutComponent implements OnInit {
  checkoutForm = this.fb.group({
    fullName: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    postalCode: ['', Validators.required],
    country: ['USA', Validators.required],
    paymentMethod: ['credit_card', Validators.required],
    cardNumber: [''],
    cardExpiry: [''],
    cardCvc: ['']
  });
  
  isSubmitting = false;
  cart: any = null;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
    });
    this.cartService.loadCart();
  }

  submit(): void {
    if (this.checkoutForm.invalid || !this.cart?.items?.length) {
      if (!this.cart?.items?.length) {
        this.snackBar.open('Your cart is empty!', 'Close', { duration: 3000 });
      } else {
        this.snackBar.open('Please fill out all required shipping fields.', 'Close', { duration: 3000 });
      }
      return;
    }

    this.isSubmitting = true;

    // Simulate API delay for polish and presentation
    setTimeout(() => {
        this.snackBar.open('Order placed successfully! Redirecting...', 'Close', { 
            horizontalPosition: 'center', 
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
            duration: 3000 
        });
        
        this.cartService.clearCart();
        this.isSubmitting = false;
        
        setTimeout(() => this.router.navigate(['/']), 1500);
    }, 1800);
  }
}
