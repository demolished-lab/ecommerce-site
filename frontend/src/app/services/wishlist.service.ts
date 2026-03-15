import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly STORAGE_KEY = 'marketplace_wishlist';
  private wishlistSubject = new BehaviorSubject<WishlistItem[]>([]);
  wishlist$ = this.wishlistSubject.asObservable();

  constructor() {
    this.loadWishlist();
  }

  private loadWishlist(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        this.wishlistSubject.next(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing wishlist from storage', e);
        this.wishlistSubject.next([]);
      }
    }
  }

  private saveWishlist(items: WishlistItem[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    this.wishlistSubject.next(items);
  }

  getWishlistItems(): WishlistItem[] {
    return this.wishlistSubject.value;
  }

  toggleWishlist(product: Product): boolean {
    const current = this.getWishlistItems();
    const index = current.findIndex(item => item.id === product.id);
    
    let updated;
    let added = false;
    
    if (index > -1) {
      updated = current.filter(item => item.id !== product.id);
    } else {
      const newItem: WishlistItem = {
        id: product.id,
        name: product.title,
        price: product.price,
        image: product.primary_image || ''
      };
      updated = [...current, newItem];
      added = true;
    }
    
    this.saveWishlist(updated);
    return added;
  }

  isInWishlist(productId: string): boolean {
    return this.getWishlistItems().some(item => item.id === productId);
  }

  removeFromWishlist(productId: string): void {
    const current = this.getWishlistItems();
    const updated = current.filter(item => item.id !== productId);
    this.saveWishlist(updated);
  }

  clearWishlist(): void {
    this.saveWishlist([]);
  }
}
