const Cart=require('../models/cart')
const Product=require('../models/product')
const Order=require('../models/order')

module.exports.addProduct=async (req, res) => {
  const product = await Product.findById(req.params.id);
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find(item => item.product.equals(product._id));
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({ product: product._id, quantity: 1 });
  }

  await cart.save();
  req.flash('success', 'Added to cart!');
  res.redirect(`/product/${product._id}`);
}

module.exports.renderCart=async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  res.render('cart/show', { cart });
}

module.exports.checkout=async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) return res.redirect('/cart');

  const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const order = new Order({
    user: req.user._id,
    items: cart.items.map(i => ({ product: i.product._id, quantity: i.quantity })),
    total
  });
  
  await order.save();
await order.populate('items.product');
  await Cart.findOneAndDelete({ user: req.user._id });
  res.render('buy/show', { order });
}

module.exports.removeProduct=async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) return res.redirect('/cart');

  const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const order = new Order({
    user: req.user._id,
    items: cart.items.map(i => ({ product: i.product._id, quantity: i.quantity })),
    total
  });

  await order.save();
await order.populate('items.product');
  await Cart.findOneAndDelete({ user: req.user._id });
  res.render('buy/show', { order });
}