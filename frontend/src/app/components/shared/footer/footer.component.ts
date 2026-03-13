import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatIconModule, MatButtonModule],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3 class="footer-title">Marketplace</h3>
            <p class="footer-text">
              Your one-stop destination for discovering amazing products from thousands of trusted sellers worldwide.
            </p>
          </div>

          <div class="footer-section">
            <h4 class="footer-subtitle">Quick Links</h4>
            <ul class="footer-links">
              <li><a routerLink="/products">Products</a></li>
              <li><a routerLink="/sellers">Sellers</a></li>
              <li><a routerLink="/become-seller">Become a Seller</a></li>
              <li><a routerLink="/about">About Us</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4 class="footer-subtitle">Customer Service</h4>
            <ul class="footer-links">
              <li><a routerLink="/help">Help Center</a></li>
              <li><a routerLink="/shipping">Shipping Info</a></li>
              <li><a routerLink="/returns">Returns & Refunds</a></li>
              <li><a routerLink="/contact">Contact Us</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4 class="footer-subtitle">Follow Us</h4>
            <div class="social-links">
              <a href="#" mat-icon-button aria-label="Facebook">
                <mat-icon>facebook</mat-icon>
              </a>
              <a href="#" mat-icon-button aria-label="Twitter">
                <mat-icon>twitter</mat-icon>
              </a>
              <a href="#" mat-icon-button aria-label="Instagram">
                <mat-icon>instagram</mat-icon>
              </a>
              <a href="#" mat-icon-button aria-label="LinkedIn">
                <mat-icon>linkedin</mat-icon>
              </a>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; {{ currentYear }} Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: #263238;
      color: white;
      padding: 48px 0 24px;
    }

    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 32px;
      margin-bottom: 32px;
    }

    .footer-section {
      display: flex;
      flex-direction: column;
    }

    .footer-title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 16px;
    }

    .footer-subtitle {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 16px;
      color: #90a4ae;
    }

    .footer-text {
      color: #b0bec5;
      line-height: 1.6;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li {
      margin-bottom: 8px;
    }

    .footer-links a {
      color: #b0bec5;
      text-decoration: none;
      transition: color 0.2s;
    }

    .footer-links a:hover {
      color: white;
    }

    .social-links {
      display: flex;
      gap: 8px;
    }

    .social-links a {
      color: white;
    }

    .footer-bottom {
      border-top: 1px solid #37474f;
      padding-top: 24px;
      text-align: center;
      color: #90a4ae;
    }

    @media (max-width: 768px) {
      .footer-content {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
