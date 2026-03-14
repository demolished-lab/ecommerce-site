from app.config.database import SessionLocal
from app.utils.password_hash import hash_password
from app.models.user import User, UserAddress
from app.models.seller import Seller
from app.models.product import Product, Category, ProductStatus
from app.models.cart import Cart, CartItem

s = SessionLocal()
try:
    buyer = s.query(User).filter(User.email == 'buyer@example.com').first()
    if not buyer:
        buyer = User(
            email='buyer@example.com',
            password_hash=hash_password('Password1!'),
            first_name='Buyer',
            last_name='Test',
            role='buyer',
        )
        s.add(buyer)
        s.flush()

    address = s.query(UserAddress).filter(UserAddress.user_id == buyer.id).first()
    if not address:
        address = UserAddress(
            user_id=buyer.id,
            street_address='123 Main St',
            apartment='Apt 1',
            city='Seattle',
            state='WA',
            postal_code='98101',
            country='USA',
            phone='5551234567',
        )
        s.add(address)

    seller_user = s.query(User).filter(User.email == 'seller@example.com').first()
    if not seller_user:
        seller_user = User(
            email='seller@example.com',
            password_hash=hash_password('Password1!'),
            first_name='Seller',
            last_name='Test',
            role='seller',
        )
        s.add(seller_user)
        s.flush()

    seller = s.query(Seller).filter(Seller.user_id == seller_user.id).first()
    if not seller:
        seller = Seller(
            user_id=seller_user.id,
            store_name='Seller Store',
            store_slug='seller-store',
            business_name='Seller Inc',
            business_type='LLC',
            business_email='seller@example.com',
            business_phone='5551234568',
            address_street='456 Market St',
            address_city='Seattle',
            address_state='WA',
            address_postal='98102',
            address_country='USA',
            status='active',
        )
        s.add(seller)
        s.flush()

    category = s.query(Category).filter(Category.slug == 'general').first()
    if not category:
        category = Category(name='General', slug='general', description='General goods')
        s.add(category)
        s.flush()

    product = s.query(Product).filter(Product.slug == 'test-product').first()
    if not product:
        product = Product(
            seller_id=seller.id,
            category_id=category.id,
            title='Test Product',
            slug='test-product',
            description='A test product',
            short_description='Test product',
            price=19.99,
            compare_at_price=24.99,
            currency='USD',
            sku='TP-001',
            stock_quantity=20,
            status=ProductStatus.ACTIVE,
            condition='new',
            is_featured=False,
            weight=0.5,
        )
        s.add(product)
        s.flush()

    cart = s.query(Cart).filter(Cart.user_id == buyer.id).first()
    if not cart:
        cart = Cart(
            user_id=buyer.id,
            subtotal=19.99,
            tax_amount=1.6,
            total=21.59,
            item_count=1,
            unique_item_count=1,
        )
        s.add(cart)
        s.flush()
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=product.id,
            quantity=1,
            unit_price=19.99,
            total_price=19.99,
            product_name=product.title,
            product_image=None,
        )
        s.add(cart_item)

    s.commit()
    print('seed done', buyer.id, address.id)
finally:
    s.close()
