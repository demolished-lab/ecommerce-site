import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { SellerGuard } from './guards/seller.guard';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./components/product/product-list/product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'product/:slug',
    loadComponent: () => import('./components/product/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'category/:slug',
    loadComponent: () => import('./components/product/category/category.component').then(m => m.CategoryComponent)
  },
  {
    path: 'seller/:slug',
    loadComponent: () => import('./components/seller/seller-store/seller-store.component').then(m => m.SellerStoreComponent)
  },
  {
    path: 'sellers',
    loadComponent: () => import('./components/seller/seller-list/seller-list.component').then(m => m.SellerListComponent)
  },
  {
    path: 'search',
    loadComponent: () => import('./components/shared/search/search.component').then(m => m.SearchComponent)
  },

  // Auth routes
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [AuthGuard],
    data: { requireGuest: true }
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [AuthGuard],
    data: { requireGuest: true }
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password/:token',
    loadComponent: () => import('./components/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },

  // Buyer routes (authenticated)
  {
    path: 'cart',
    loadComponent: () => import('./components/cart/cart.component').then(m => m.CartComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./components/buyer/orders/orders.component').then(m => m.OrdersComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'order/:id',
    loadComponent: () => import('./components/buyer/order-detail/order-detail.component').then(m => m.OrderDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/buyer/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'addresses',
    loadComponent: () => import('./components/buyer/addresses/addresses.component').then(m => m.AddressesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./components/buyer/wishlist/wishlist.component').then(m => m.WishlistComponent),
    canActivate: [AuthGuard]
  },

  // Seller routes
  {
    path: 'seller',
    canActivate: [AuthGuard, SellerGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/seller/dashboard/dashboard.component').then(m => m.SellerDashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./components/seller/products/products.component').then(m => m.SellerProductsComponent)
      },
      {
        path: 'products/new',
        loadComponent: () => import('./components/seller/product-form/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'products/edit/:id',
        loadComponent: () => import('./components/seller/product-form/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./components/seller/orders/orders.component').then(m => m.SellerOrdersComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./components/seller/analytics/analytics.component').then(m => m.SellerAnalyticsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/seller/settings/settings.component').then(m => m.SellerSettingsComponent)
      }
    ]
  },
  {
    path: 'become-seller',
    loadComponent: () => import('./components/seller/apply/apply.component').then(m => m.SellerApplyComponent),
    canActivate: [AuthGuard]
  },

  // Admin routes
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./components/admin/users/users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'sellers',
        loadComponent: () => import('./components/admin/sellers/sellers.component').then(m => m.AdminSellersComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./components/admin/products/products.component').then(m => m.AdminProductsComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./components/admin/orders/orders.component').then(m => m.AdminOrdersComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./components/admin/categories/categories.component').then(m => m.AdminCategoriesComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/admin/settings/settings.component').then(m => m.AdminSettingsComponent)
      }
    ]
  },

  // Error routes
  { path: '404', loadComponent: () => import('./components/shared/not-found/not-found.component').then(m => m.NotFoundComponent) },
  { path: '**', redirectTo: '404' }
];
