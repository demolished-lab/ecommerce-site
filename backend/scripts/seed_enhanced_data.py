from app.config.database import SessionLocal
from app.utils.password_hash import hash_password
from app.models.user import User, UserAddress
from app.models.seller import Seller
from app.models.product import Product, Category, ProductStatus, ProductImage
from datetime import datetime, timezone
import uuid

def seed():
    db = SessionLocal()
    try:
        # 1. Create/Update Category icons and banners
        categories_data = [
            {
                "name": "Electronics", 
                "slug": "electronics", 
                "icon": "devices", 
                "image_url": "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=800&auto=format&fit=crop",
                "description": "Latest gadgets, high-performance laptops, and premium audio gear."
            },
            {
                "name": "Fashion Area", 
                "slug": "fashion", 
                "icon": "checkroom", 
                "image_url": "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop",
                "description": "Trendy apparel, sustainable fabrics, and modern accessories."
            },
            {
                "name": "Home & Kitchen", 
                "slug": "home", 
                "icon": "kitchen", 
                "image_url": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop",
                "description": "Everything for your modern kitchen and cozy home."
            },
            {
                "name": "Beauty", 
                "slug": "beauty", 
                "icon": "face", 
                "image_url": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop",
                "description": "Skincare, makeup, and wellness products for your daily routine."
            },
            {
                "name": "Sports", 
                "slug": "sports", 
                "icon": "sports_basketball", 
                "image_url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
                "description": "High-quality gear for athletes and outdoor enthusiasts."
            },
            {
                "name": "Toys & Games", 
                "slug": "toys", 
                "icon": "toys", 
                "image_url": "https://images.unsplash.com/photo-1545558014-8692077e9b5c?q=80&w=800&auto=format&fit=crop",
                "description": "Fun and educational toys and games for all ages."
            }
        ]

        categories = {}
        for cat_data in categories_data:
            cat = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
            if not cat:
                cat = Category(**cat_data)
                db.add(cat)
            else:
                # Update existing category with new images and descriptions
                cat.name = cat_data["name"]
                cat.icon = cat_data["icon"]
                cat.image_url = cat_data["image_url"]
                cat.description = cat_data["description"]
            db.flush()
            categories[cat_data["slug"]] = cat

        # 2. Create Sellers with professional branding
        sellers_data = [
            {
                "email": "tech-haven@example.com",
                "store_name": "Tech Haven",
                "store_slug": "tech-haven",
                "store_description": "Premium electronics and gadgets for tech enthusiasts. We pride ourselves on fast shipping and excellent customer service.",
                "store_logo": "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?q=80&w=300&auto=format&fit=crop",
                "store_banner": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop",
                "address_city": "San Francisco",
                "is_verified": True
            },
            {
                "email": "urban-threads@example.com",
                "store_name": "Urban Threads",
                "store_slug": "urban-threads",
                "store_description": "Trendy fashion for the modern urban lifestyle. Sustainable materials and ethical manufacturing.",
                "store_logo": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=300&auto=format&fit=crop",
                "store_banner": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
                "address_city": "New York",
                "is_verified": True
            }
        ]

        sellers = {}
        for s_data in sellers_data:
            user = db.query(User).filter(User.email == s_data["email"]).first()
            if not user:
                user = User(
                    email=s_data["email"],
                    password_hash=hash_password("Password1!"),
                    first_name=s_data["store_name"].split()[0],
                    last_name="Owner",
                    role="seller"
                )
                db.add(user)
                db.flush()
            
            seller = db.query(Seller).filter(Seller.user_id == user.id).first()
            if not seller:
                seller = Seller(
                    user_id=user.id,
                    store_name=s_data["store_name"],
                    store_slug=s_data["store_slug"],
                    store_description=s_data["store_description"],
                    store_logo=s_data["store_logo"],
                    store_banner=s_data["store_banner"],
                    business_name=f"{s_data['store_name']} LLC",
                    business_type="Retail",
                    business_email=s_data["email"],
                    business_phone="555-0101",
                    address_street="Market St",
                    address_city=s_data["address_city"],
                    address_state="CA" if "San Francisco" in s_data["address_city"] else "NY",
                    address_postal="00000",
                    status="active",
                    is_verified=s_data["is_verified"]
                )
                db.add(seller)
                db.flush()
            sellers[s_data["store_slug"]] = seller

        # 3. Create Enhanced Products
        products_data = [
            {
                "seller": "tech-haven",
                "category": "electronics",
                "title": "Quantum Pro Wireless Headphones",
                "slug": "premium-wireless-headphones",
                "description": "Experience unparalleled sound quality with active noise cancellation and 40-hour battery life. Designed for audiophiles and professionals alike.",
                "price": 249.99,
                "compare_at_price": 299.99,
                "primary_image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
                "is_featured": True
            },
            {
                "seller": "urban-threads",
                "category": "fashion",
                "title": "Eco-Minimalist Cotton Hoodie",
                "slug": "eco-minimalist-hoodie",
                "description": "Crafted from 100% organic cotton, this hoodie offers ultimate comfort with a sustainable touch.",
                "price": 75.00,
                "compare_at_price": 85.00,
                "primary_image": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000&auto=format&fit=crop",
                "is_featured": True
            },
            {
                "seller": "tech-haven",
                "category": "electronics",
                "title": "Horizon Ultra-Thin Laptop",
                "slug": "horizon-ultra-laptop",
                "description": "The ultimate portable powerhouse with a 4K OLED display and high-speed SSD.",
                "price": 1499.00,
                "compare_at_price": 1699.00,
                "primary_image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000&auto=format&fit=crop",
                "is_featured": True
            },
            {
                "seller": "urban-threads",
                "category": "fashion",
                "title": "Denim Trucker Jacket",
                "slug": "denim-jacket",
                "description": "Classic fit washed denim jacket. Timeless, durable, and stylish.",
                "price": 90.00,
                "compare_at_price": 110.00,
                "primary_image": "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop",
                "is_featured": False
            }
        ]

        for p_data in products_data:
            prod = db.query(Product).filter(Product.slug == p_data["slug"]).first()
            if not prod:
                prod = Product(
                    seller_id=sellers[p_data["seller"]].id,
                    category_id=categories[p_data["category"]].id,
                    title=p_data["title"],
                    slug=p_data["slug"],
                    description=p_data["description"],
                    price=p_data["price"],
                    compare_at_price=p_data["compare_at_price"],
                    status=ProductStatus.ACTIVE,
                    is_featured=p_data["is_featured"],
                    stock_quantity=50
                )
                db.add(prod)
                db.flush()
                
                # Add image
                img = ProductImage(
                    product_id=prod.id,
                    image_url=p_data["primary_image"],
                    is_primary=True
                )
                db.add(img)

        db.commit()
        print("Enhanced seeding completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
