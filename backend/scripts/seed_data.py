from app.config.database import SessionLocal
from app.utils.password_hash import hash_password
from app.models.user import User, UserAddress, AddressType
from app.models.seller import Seller
from app.models.product import Product, Category
from app.models.cart import Cart, CartItem
from app.models.product import ProductStatus


db = SessionLocal()
try:
    # Create buyer user
    buyer = User(
        email="buyer@example.com",
        password_hash=hash_password("Password1!"),
        first_name="Buyer",
        last_name="Test",
        role="buyer",
    )
    db.add(buyer)
    db.flush()

    # Add default shipping address
    addr = UserAddress(
        user_id=buyer.id,
        street_address="123 Main St",
        apartment="Apt 1",
        city="Seattle",
        state="WA",
        postal_code="98101",
        country="USA",
        phone="5551234567",
    )
    db.add(addr)

    # Create seller user
    seller_user = User(
        email="seller@example.com",
        password_hash=hash_password("Password1!"),
        first_name="Seller",
        last_name="Test",
        role="seller",
    )
    db.add(seller_user)
    db.flush()

    seller = Seller(
        user_id=seller_user.id,
        store_name="Seller Store",
        store_slug="seller-store",
        business_name="Seller Inc",
        business_type="LLC",
        business_email="seller@example.com",
        business_phone="5551234568",
        address_street="456 Market St",
        address_city="Seattle",
        address_state="WA",
        address_postal="98102",
        address_country="USA",
        status="active",
    )
    db.add(seller)
    db.flush()

    category = Category(name="General", slug="general", description="General goods")
    db.add(category)
    db.flush()

    product = Product(
        seller_id=seller.id,
        category_id=category.id,
        title="Test Product",
        slug="test-product",
        description="A test product",
        short_description="Test product",
        price=19.99,
        compare_at_price=24.99,
        currency="USD",
        sku="TP-001",
        stock_quantity=20,
        status=ProductStatus.ACTIVE,
        condition="new",
        is_featured=False,
        weight=0.5,
    )
    db.add(product)
    db.flush()

    # Create cart for buyer
    cart = Cart(user_id=buyer.id, subtotal=19.99, tax_amount=1.6, total=21.59, item_count=1, unique_item_count=1)
    db.add(cart)
    db.flush()

    cart_item = CartItem(
        cart_id=cart.id,
        product_id=product.id,
        quantity=1,
        unit_price=19.99,
        total_price=19.99,
        product_name=product.title,
        product_image=None,
        variant_name=None,
    )
    db.add(cart_item)

    db.commit()
    print("Seed completed: buyer id", buyer.id, "address id", addr.id, "product id", product.id)
finally:
    db.close()
