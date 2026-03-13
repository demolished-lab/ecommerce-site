# Multi-Vendor E-Commerce Marketplace

A comprehensive, production-ready multi-vendor e-commerce platform built with **FastAPI** (Python) backend and **Angular** frontend. This platform enables multiple sellers to create stores, list products, and sell to buyers while administrators manage the marketplace.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│                      Angular SPA (Port 4200)                │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────────────┐ │
│  │   Buyer UI  │ │ Seller UI   │ │   Admin Dashboard      │ │
│  └─────────────┘ └─────────────┘ └──────────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS/HTTP
┌───────────────────────────▼─────────────────────────────────┐
│                   Application Layer                          │
│                   FastAPI (Port 8000)                        │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────────────┐   │
│  │   Auth    │ │ Products    │ │   Orders             │   │
│  │   Service │ │ Service     │ │   Service            │   │
│  └─────────────┘ └─────────────┘ └──────────────────────┘   │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────────────┐   │
│  │   Cart    │ │ Payment     │ │   Sellers            │   │
│  │   Service │ │ Service     │ │   Service            │   │
│  └─────────────┘ └─────────────┘ └──────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │ SQL
┌───────────────────────────▼─────────────────────────────────┐
│                      Data Layer                              │
│                   PostgreSQL + Redis                         │
└─────────────────────────────────────────────────────────────┘
```

## Features

### Buyer Features
- User registration and authentication (JWT-based)
- Product browsing with advanced filters
- Product search with autocomplete
- Shopping cart management
- Secure checkout with multiple payment options
- Order tracking and history
- Product reviews and ratings
- Wishlist functionality
- Multiple shipping addresses
- Email notifications

### Seller Features
- Seller application and verification
- Product management (CRUD operations)
- Product variants and options
- Image upload with automatic resizing
- Inventory tracking
- Order management
- Sales analytics dashboard
- Revenue reports
- Customer messaging
- Store customization

### Admin Features
- User management
- Seller approval workflow
- Product moderation
- Order management
- Category management
- Platform analytics
- Commission settings
- Dispute resolution
- Email template management

### Technical Features
- RESTful API design
- Role-based access control (RBAC)
- Image optimization and CDN-ready
- Email service integration
- Payment gateway integration (Stripe)
- Real-time notifications (WebSocket ready)
- Search with Elasticsearch ready
- Caching with Redis
- Background task processing with Celery
- Docker containerization
- CI/CD ready

## Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt
- **Caching**: Redis
- **Task Queue**: Celery
- **Validation**: Pydantic v2
- **Testing**: pytest

### Frontend
- **Framework**: Angular 17+
- **UI Components**: Angular Material
- **State Management**: RxJS + Services
- **HTTP Client**: Angular HttpClient
- **Forms**: Reactive Forms
- **Charts**: Chart.js
- **Payments**: Stripe Elements

### DevOps
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx
- **Process Manager**: Uvicorn
- **SSL**: Let's Encrypt (certbot)

## Quick Start

### Prerequisites
- Docker 24.0+
- Docker Compose 2.20+
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Option 1: Docker Deployment (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/your-org/marketplace.git
cd marketplace
```

2. Set up environment variables:
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your configurations
```

3. Start all services:
```bash
docker-compose up -d
```

4. Access the application:
   - Frontend: http://localhost:4200
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Option 2: Local Development

#### Backend Setup

1. Create virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up database:
```bash
# Create PostgreSQL database
createdb marketplace

# Run migrations
alembic upgrade head

# Seed initial data (optional)
python scripts/seed.py
```

4. Run the server:
```bash
uvicorn app.main:app --reload
```

#### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure environment:
```bash
# Edit src/environments/environment.ts
```

3. Run development server:
```bash
ng serve
```

## Project Structure

```
marketplace/
├── backend/
│   ├── app/
│   │   ├── config/         # Configuration files
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth middleware
│   │   ├── utils/          # Utilities
│   │   └── main.py         # Application entry
│   ├── alembic/            # Database migrations
│   ├── tests/              # Test files
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/ # Angular components
│   │   │   ├── services/   # Angular services
│   │   │   ├── models/     # TypeScript interfaces
│   │   │   ├── guards/     # Route guards
│   │   │   └── interceptors/ # HTTP interceptors
│   │   ├── assets/         # Static assets
│   │   └── environments/   # Environment configs
│   ├── angular.json
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

## API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### Product Endpoints
- `GET /api/v1/products` - List products
- `GET /api/v1/products/:id` - Get product
- `POST /api/v1/products` - Create product (seller)
- `PUT /api/v1/products/:id` - Update product (seller)
- `DELETE /api/v1/products/:id` - Delete product (seller)
- `GET /api/v1/products/featured` - Get featured products
- `GET /api/v1/categories` - List categories

### Cart Endpoints
- `GET /api/v1/cart` - Get cart
- `POST /api/v1/cart/add` - Add item to cart
- `PUT /api/v1/cart/update` - Update cart item
- `DELETE /api/v1/cart/remove` - Remove cart item
- `POST /api/v1/cart/coupon` - Apply coupon

### Order Endpoints
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - List user orders
- `GET /api/v1/orders/:id` - Get order details
- `PUT /api/v1/orders/:id/status` - Update order status
- `POST /api/v1/orders/:id/cancel` - Cancel order

### Seller Endpoints
- `POST /api/v1/sellers/apply` - Apply as seller
- `GET /api/v1/sellers/me` - Get seller profile
- `PUT /api/v1/sellers/me` - Update seller profile
- `GET /api/v1/sellers/dashboard/stats` - Get dashboard stats
- `GET /api/v1/sellers/orders` - Get seller orders

Full API documentation available at `/docs` when running the backend.

## Configuration

### Environment Variables

#### Backend (.env)
```env
# Application
APP_NAME=Marketplace
DEBUG=false
SECRET_KEY=your-secret-key

# Database
DATABASE_URL=postgresql://user:pass@localhost/marketplace

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION_HOURS=24

# Email
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Redis
REDIS_URL=redis://localhost:6379/0
```

#### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1',
  stripePublicKey: 'pk_test_...'
};
```

## Database Schema

### Core Tables
- `users` - User accounts
- `sellers` - Seller profiles
- `products` - Product listings
- `product_variants` - Product options
- `product_images` - Product images
- `categories` - Product categories
- `carts` - Shopping carts
- `cart_items` - Cart items
- `orders` - Orders
- `order_items` - Order line items
- `payments` - Payment records

See `backend/app/models/` for full schema definitions.

## Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- CSRF protection
- XSS prevention
- SQL injection prevention (parameterized queries)
- Rate limiting (ready)
- CORS configured
- Secure headers
- Input validation (Pydantic)

## Testing

### Backend Tests
```bash
cd backend
pytest
pytest --cov=app tests/
```

### Frontend Tests
```bash
cd frontend
ng test
```

## Deployment

### Production Deployment

1. Build production images:
```bash
docker-compose -f docker-compose.prod.yml build
```

2. Deploy with Docker Compose:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. Run migrations:
```bash
docker-compose exec api alembic upgrade head
```

### Cloud Deployment

#### AWS
- ECS/EKS for container orchestration
- RDS for PostgreSQL
- ElastiCache for Redis
- S3 for file storage
- CloudFront for CDN
- Route 53 for DNS

#### DigitalOcean
- App Platform for deployment
- Managed PostgreSQL
- Managed Redis
- Spaces for file storage

## Monitoring & Logging

- Application metrics: Prometheus + Grafana
- Logs: ELK Stack or CloudWatch
- Error tracking: Sentry (ready)
- APM: New Relic or DataDog (ready)

## Roadmap

### Phase 1 (Current)
- Core marketplace functionality
- Basic seller tools
- Payment integration
- Email notifications

### Phase 2
- Advanced analytics
- Multi-language support
- Mobile app (Ionic/React Native)
- Advanced shipping rules

### Phase 3
- AI-powered recommendations
- Chat system
- Auction functionality
- Subscription products

### Phase 4
- Multi-vendor marketplace network
- API for third-party integrations
- Marketplace mobile SDK
- White-label solutions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- Documentation: https://docs.marketplace.com
- Issues: https://github.com/your-org/marketplace/issues
- Email: support@marketplace.com

## Acknowledgments

- FastAPI team for the amazing framework
- Angular team for the frontend framework
- Material Design for the UI components
- All open-source contributors

---

Built with ❤️ for the e-commerce community
