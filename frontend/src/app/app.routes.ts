import { Routes } from "@angular/router";

export const appRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./components/home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "products",
    loadComponent: () =>
      import("./components/product/product-list/product-list.component").then(
        (m) => m.ProductListComponent,
      ),
  },
  {
    path: "product/:slug",
    loadComponent: () =>
      import("./components/product/product-detail/product-detail.component").then(
        (m) => m.ProductDetailComponent,
      ),
  },
  {
    path: "category/:slug",
    loadComponent: () =>
      import("./components/product/category/category.component").then(
        (m) => m.CategoryComponent,
      ),
  },
  {
    path: "categories",
    loadComponent: () =>
      import("./components/product/categorylist/categorylist.component").then(
        (m) => m.CategoryListComponent,
      ),
  },
  {
    path: "sellers",
    loadComponent: () =>
      import("./components/seller/seller-list/seller-list.component").then(
        (m) => m.SellerListComponent,
      ),
  },
  {
    path: "search",
    loadComponent: () =>
      import("./components/shared/search/search.component").then(
        (m) => m.SearchComponent,
      ),
  },
  {
    path: "login",
    loadComponent: () =>
      import("./components/auth/login/login.component").then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: "register",
    loadComponent: () =>
      import("./components/auth/register/register.component").then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: "forgot-password",
    loadComponent: () =>
      import("./components/auth/forgot-password/forgot-password.component").then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: "reset-password/:token",
    loadComponent: () =>
      import("./components/auth/reset-password/reset-password.component").then(
        (m) => m.ResetPasswordComponent,
      ),
  },
  {
    path: "cart",
    loadComponent: () =>
      import("./components/cart/cart.component").then((m) => m.CartComponent),
  },
  {
    path: "checkout",
    loadComponent: () =>
      import("./components/checkout/checkout.component").then(
        (m) => m.CheckoutComponent,
      ),
  },
  {
    path: "orders",
    loadComponent: () =>
      import("./components/buyer/orders/orders.component").then(
        (m) => m.OrdersComponent,
      ),
  },
  {
    path: "order/:id",
    loadComponent: () =>
      import("./components/buyer/order-detail/order-detail.component").then(
        (m) => m.OrderDetailComponent,
      ),
  },
  {
    path: "profile",
    loadComponent: () =>
      import("./components/buyer/profile/profile.component").then(
        (m) => m.ProfileComponent,
      ),
  },
  {
    path: "addresses",
    loadComponent: () =>
      import("./components/buyer/addresses/addresses.component").then(
        (m) => m.AddressesComponent,
      ),
  },
  {
    path: "wishlist",
    loadComponent: () =>
      import("./components/buyer/wishlist/wishlist.component").then(
        (m) => m.WishlistComponent,
      ),
  },
  {
    path: "about",
    redirectTo: "",
    pathMatch: "full"
  },
  {
    path: "help",
    redirectTo: "",
    pathMatch: "full"
  },
  {
    path: "shipping",
    redirectTo: "",
    pathMatch: "full"
  },
  {
    path: "returns",
    redirectTo: "",
    pathMatch: "full"
  },
  {
    path: "contact",
    redirectTo: "",
    pathMatch: "full"
  },
  {
    path: "seller/dashboard",
    loadComponent: () =>
      import("./components/seller/dashboard/dashboard.component").then(
        (m) => m.SellerDashboardComponent,
      ),
  },
  {
    path: "seller/products",
    loadComponent: () =>
      import("./components/seller/products/products.component").then(
        (m) => m.SellerProductsComponent,
      ),
  },
  {
    path: "seller/products/new",
    loadComponent: () =>
      import("./components/seller/product-form/product-form.component").then(
        (m) => m.ProductFormComponent,
      ),
  },
  {
    path: "seller/products/edit/:id",
    loadComponent: () =>
      import("./components/seller/product-form/product-form.component").then(
        (m) => m.ProductFormComponent,
      ),
  },
  {
    path: "seller/orders",
    loadComponent: () =>
      import("./components/seller/orders/orders.component").then(
        (m) => m.SellerOrdersComponent,
      ),
  },
  {
    path: "seller/analytics",
    loadComponent: () =>
      import("./components/seller/analytics/analytics.component").then(
        (m) => m.SellerAnalyticsComponent,
      ),
  },
  {
    path: "seller/settings",
    loadComponent: () =>
      import("./components/seller/settings/settings.component").then(
        (m) => m.SellerSettingsComponent,
      ),
  },
  {
    path: "seller/:slug",
    loadComponent: () =>
      import("./components/seller/seller-store/seller-store.component").then(
        (m) => m.SellerStoreComponent,
      ),
  },
  {
    path: "become-seller",
    loadComponent: () =>
      import("./components/seller/apply/apply.component").then(
        (m) => m.SellerApplyComponent,
      ),
  },
  {
    path: "admin/dashboard",
    loadComponent: () =>
      import("./components/admin/dashboard/dashboard.component").then(
        (m) => m.AdminDashboardComponent,
      ),
  },
  {
    path: "admin/users",
    loadComponent: () =>
      import("./components/admin/users/users.component").then(
        (m) => m.AdminUsersComponent,
      ),
  },
  {
    path: "admin/sellers",
    loadComponent: () =>
      import("./components/admin/sellers/sellers.component").then(
        (m) => m.AdminSellersComponent,
      ),
  },
  {
    path: "admin/products",
    loadComponent: () =>
      import("./components/admin/products/products.component").then(
        (m) => m.AdminProductsComponent,
      ),
  },
  {
    path: "admin/orders",
    loadComponent: () =>
      import("./components/admin/orders/orders.component").then(
        (m) => m.AdminOrdersComponent,
      ),
  },
  {
    path: "admin/categories",
    loadComponent: () =>
      import("./components/admin/categories/categories.component").then(
        (m) => m.AdminCategoriesComponent,
      ),
  },
  {
    path: "admin/settings",
    loadComponent: () =>
      import("./components/admin/settings/settings.component").then(
        (m) => m.AdminSettingsComponent,
      ),
  },
  {
    path: "404",
    loadComponent: () =>
      import("./components/shared/not-found/not-found.component").then(
        (m) => m.NotFoundComponent,
      ),
  },
  { path: "**", redirectTo: "404" },
];
