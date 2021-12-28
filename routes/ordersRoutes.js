const router = require('express').Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const isAdmin = require('../middleware/isAdmin');

// @Route GET api/orders
// @Desc get all orders
// @Access private ADMIN ONLY
router.get('/', isAdmin, async (req, res) => {
	try {
		const ordersList = await Order.find();
		if (!ordersList) {
			return res.status(400).send({ msg: 'No orders available' });
		}
		res.send(ordersList);
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});
// @Route GET api/orders
// @Desc get number of all orders
// @Access private Private ONLY
router.get('/numberOfOrders', async (req, res) => {
	try {
		const ordersList = await Order.find();
		if (!ordersList) {
			return res.status(400).send({ msg: 'No orders available' });
		}
		res.send({ numberOfOrders: ordersList.length });
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

// @Route GET api/orders/customer-orders
// @Desc get all customer orders
// @Access private per customer
router.get('/customer-orders', authUser, async (req, res) => {
	try {
		const customerOrdersList = await Order.find({
			customer_id: req.session.user._id,
		});

		if (!customerOrdersList) {
			return res.status(400).send({ msg: 'No orders found' });
		}
		res.send(customerOrdersList);
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

// @Route GET api/orders/customer-orders/:orderId
// @Desc get single order per customer by order id
// @Access private per customer
router.get('/customer-orders/:orderId', authUser, async (req, res) => {
	try {
		const order = await Order.findById({ _id: req.params.orderId });
		if (!order) {
			return res.status(400).send({ msg: 'No order found' });
		}
		res.send(order);
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

// @Route GET api/orders/open-order
// @Desc get open order only
// @Access private per customer
router.get('/open-order', authUser, async (req, res) => {
	try {
		let user = await User.findById(req.session.user._id).populate({
			path: 'orders',
			model: 'order',
			match: { isOpen: true },
			populate: {
				model: 'product',
				path: 'products_list.product',
				populate: {
					path: 'category',
					model: 'category',
				},
			},
		});
		if (user.orders.length == 0) {
			return res.status(400).send({ msg: 'No open orders found' });
		}
		res.send(user.orders);
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

// @Route POST api/orders/new-order
// @Desc Add new order
// @Access private CUSTOMER ONLY
router.post('/new-order', authUser, async (req, res) => {
	// Check user role
	if (req.session.user.role === 'admin') {
		return res
			.status(400)
			.send({ msg: 'Only customer are allowed to make an order' });
	}
	try {
		// Check if there
		const openOrder = await Order.findOne({
			customer: req.session.user._id,
		}).where({ isOpen: true });
		if (openOrder) {
			return res.send({
				error: 'You already have open order',
				order: openOrder._id,
				user: req.session.user._id,
			});
		}
		newOrder = new Order({
			customer: req.session.user._id,
		});
		const user = await User.findById(req.session.user._id);
		user.orders.push(newOrder._id);
		newOrder.save();
		user.save();
		res.send({ msg: `${newOrder._id} added to orders list` });
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

// @Route PUT api/orders/add-item/:orderId
// @Desc Add item to open order
// @Access private
router.put('/add-item/:orderId', authUser, async (req, res) => {
	const { product, quantity } = req.body;
	try {
		const order = await Order.findById(req.params.orderId);
		if (!order) {
			return res.status(400).send({ error: 'Order not found' });
		}
		const isAdded = order.products_list.find(
			(pct) => pct.product._id.toString() === product
		);
		if (isAdded) {
			return res.status(400).send({
				error: 'Product already in order, consider update the quantity',
			});
		}
		order.products_list.push({ product, quantity });
		order.save();
		res.send({ msg: `item added to order ${order._id} ` });
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

// @Route PUT api/orders/remove-item/:orderId/:itemId
// @Desc Remove item from open order
// @Access private
router.put('/remove-item/:orderId/:itemId', authUser, async (req, res) => {
	try {
		const order = await Order.findById(req.params.orderId).populate({
			model: 'product',
			path: 'products_list.product',
			populate: {
				path: 'category',
				model: 'category',
			},
		});
		if (!order) {
			return res.status(400).send({ error: 'Order not found' });
		}
		order.products_list.map(async (item, index) => {
			if (item._id.toString() === req.params.itemId) {
				await Product.findByIdAndUpdate(
					{ _id: order.products_list[index].product._id },
					{ $inc: { stock: order.products_list[index].quantity } },
					{ new: true }
				);
				order.products_list.splice(index, 1);
				order.save();
				res.send({
					msg: `item removed from cart`,
					order: order,
				});
			}
		});
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

// @Route PUT api/orders/update-item/:orderId/:itemId
// @Desc Update quantity up for item
// @Access private
router.put('/update-item/up/:orderId/:itemId', authUser, async (req, res) => {
	try {
		const order = await Order.findById(req.params.orderId).populate({
			model: 'product',
			path: 'products_list.product',
			populate: {
				path: 'category',
				model: 'category',
			},
		});
		if (!order) {
			return res.status(400).send({ error: 'Order not found' });
		}
		order.products_list.map(async (item, index) => {
			if (item._id.toString() === req.params.itemId) {
				if (order.products_list[index].product.stock == 0) {
					return res
						.status(400)
						.send({ msg: 'Sorry there are no more items left' });
				} else {
					await Product.findByIdAndUpdate(
						{ _id: order.products_list[index].product._id },
						{ $inc: { stock: -1 } },
						{ new: true }
					);
					order.products_list[index].quantity += 1;
					order.save();
					res.send({
						msg: `item quantity updated`,
						order: order,
					});
				}
			}
		});
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});
// @Route PUT api/orders/update-item/down/:orderId/:itemId
// @Desc Update quantity down for item
// @Access private
router.put('/update-item/down/:orderId/:itemId', authUser, async (req, res) => {
	try {
		const order = await Order.findById(req.params.orderId).populate({
			model: 'product',
			path: 'products_list.product',
			populate: {
				path: 'category',
				model: 'category',
			},
		});
		if (!order) {
			return res.status(400).send({ error: 'Order not found' });
		}

		order.products_list.map(async (item, index) => {
			if (item._id.toString() === req.params.itemId) {
				if (order.products_list[index].quantity === 1) {
					order.products_list.splice(index, 1);
					order.save();
					return res
						.status(400)
						.send({ msg: 'Item was removed from your cart' });
				} else {
					order.products_list[index].quantity -= 1;
					await Product.findByIdAndUpdate(
						{ _id: order.products_list[index].product._id },
						{ $inc: { stock: 1 } },
						{ new: true }
					);
					order.save();
					res.send({
						msg: `item quantity updated`,
						order: order,
					});
				}
			}
		});
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

// @Route DELETE api/orders/delete-order/:orderId
// @Desc Delete order by id
// @Access private - Customer only
router.delete('/delete-order/:orderId', authUser, async (req, res) => {
	try {
		const order = await Order.findByIdAndRemove(
			{ _id: req.params.orderId },
			{ new: true }
		);
		if (!order) {
			return res.status(400).send({ error: 'No order found' });
		}
		console.log(order);
		return res.send({ msg: `Order was deleted` });
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

module.exports = router;
