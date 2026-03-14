from app.config.database import SessionLocal
from app.models.user import User
from app.models.cart import Cart, CartItem
from app.models.product import Product

with SessionLocal() as db:
    user = db.query(User).filter(User.email == 'buyer@example.com').first()
    if not user:
        raise Exception('buyer not found')
    product = db.query(Product).filter(Product.slug == 'test-product').first()
    if not product:
        raise Exception('product not found')
    cart = db.query(Cart).filter(Cart.user_id == user.id).first()
    if not cart:
        cart = Cart(user_id=user.id, subtotal=0, tax_amount=0, total=0, item_count=0, unique_item_count=0)
        db.add(cart)
        db.flush()
    if not cart.items:
        item = CartItem(cart_id=cart.id, product_id=product.id, quantity=1, unit_price=product.price, total_price=product.price, product_name=product.title)
        db.add(item)
        cart.subtotal = product.price
        cart.tax_amount = product.price * 0.08
        cart.total = cart.subtotal + cart.tax_amount
        cart.item_count = 1
        cart.unique_item_count = 1
        db.commit()
        print('cart refilled')
    else:
        print('cart already has', len(cart.items), 'items')
