from pathlib import Path

stubs = [
    ('src/app/components/product/product-list/product-list.component.ts', 'ProductListComponent', 'app-product-list', 'Product List'),
    ('src/app/components/product/product-detail/product-detail.component.ts', 'ProductDetailComponent', 'app-product-detail', 'Product Detail'),
    ('src/app/components/product/category/category.component.ts', 'CategoryComponent', 'app-category', 'Category'),
    ('src/app/components/seller/seller-store/seller-store.component.ts', 'SellerStoreComponent', 'app-seller-store', 'Seller Store'),
    ('src/app/components/seller/seller-list/seller-list.component.ts', 'SellerListComponent', 'app-seller-list', 'Seller List'),
    ('src/app/components/shared/search/search.component.ts', 'SearchComponent', 'app-search', 'Search'),
    ('src/app/components/auth/login/login.component.ts', 'LoginComponent', 'app-login', 'Login'),
    ('src/app/components/auth/register/register.component.ts', 'RegisterComponent', 'app-register', 'Register'),
    ('src/app/components/auth/forgot-password/forgot-password.component.ts', 'ForgotPasswordComponent', 'app-forgot-password', 'Forgot Password'),
    ('src/app/components/auth/reset-password/reset-password.component.ts', 'ResetPasswordComponent', 'app-reset-password', 'Reset Password'),
    ('src/app/components/cart/cart.component.ts', 'CartComponent', 'app-cart', 'Cart'),
    ('src/app/components/checkout/checkout.component.ts', 'CheckoutComponent', 'app-checkout', 'Checkout'),
    ('src/app/components/buyer/orders/orders.component.ts', 'OrdersComponent', 'app-orders', 'Orders'),
    ('src/app/components/buyer/order-detail/order-detail.component.ts', 'OrderDetailComponent', 'app-order-detail', 'Order Detail'),
    ('src/app/components/buyer/profile/profile.component.ts', 'ProfileComponent', 'app-profile', 'Profile'),
    ('src/app/components/buyer/addresses/addresses.component.ts', 'AddressesComponent', 'app-addresses', 'Addresses'),
    ('src/app/components/buyer/wishlist/wishlist.component.ts', 'WishlistComponent', 'app-wishlist', 'Wishlist'),
    ('src/app/components/seller/dashboard/dashboard.component.ts', 'SellerDashboardComponent', 'app-seller-dashboard', 'Seller Dashboard'),
    ('src/app/components/seller/products/products.component.ts', 'SellerProductsComponent', 'app-seller-products', 'Seller Products'),
    ('src/app/components/seller/product-form/product-form.component.ts', 'ProductFormComponent', 'app-product-form', 'Product Form'),
    ('src/app/components/seller/orders/orders.component.ts', 'SellerOrdersComponent', 'app-seller-orders', 'Seller Orders'),
    ('src/app/components/seller/analytics/analytics.component.ts', 'SellerAnalyticsComponent', 'app-seller-analytics', 'Seller Analytics'),
    ('src/app/components/seller/settings/settings.component.ts', 'SellerSettingsComponent', 'app-seller-settings', 'Seller Settings'),
    ('src/app/components/seller/apply/apply.component.ts', 'SellerApplyComponent', 'app-seller-apply', 'Become Seller'),
    ('src/app/components/admin/dashboard/dashboard.component.ts', 'AdminDashboardComponent', 'app-admin-dashboard', 'Admin Dashboard'),
    ('src/app/components/admin/users/users.component.ts', 'AdminUsersComponent', 'app-admin-users', 'Admin Users'),
    ('src/app/components/admin/sellers/sellers.component.ts', 'AdminSellersComponent', 'app-admin-sellers', 'Admin Sellers'),
    ('src/app/components/admin/products/products.component.ts', 'AdminProductsComponent', 'app-admin-products', 'Admin Products'),
    ('src/app/components/admin/orders/orders.component.ts', 'AdminOrdersComponent', 'app-admin-orders', 'Admin Orders'),
    ('src/app/components/admin/categories/categories.component.ts', 'AdminCategoriesComponent', 'app-admin-categories', 'Admin Categories'),
    ('src/app/components/admin/settings/settings.component.ts', 'AdminSettingsComponent', 'app-admin-settings', 'Admin Settings'),
    ('src/app/components/shared/not-found/not-found.component.ts', 'NotFoundComponent', 'app-not-found', 'Not Found'),
]

for path, cls, selector, title in stubs:
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(
        "import { Component } from '@angular/core';\n"
        "import { CommonModule } from '@angular/common';\n\n"
        "@Component({ selector: '%s', standalone: true, imports: [CommonModule], template: '<div style=\"padding:24px;\"><h2>%s</h2><p>%s works.</p></div>' })\n"
        "export class %s {}\n"
        % (selector, title, title, cls)
    )

print('created', len(stubs))
