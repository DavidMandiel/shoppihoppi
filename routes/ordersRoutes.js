const router = require('express').Router();
const Order = require('../models/Order');
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
		const openOrders = await Order.findOne({
			customer: req.session.user._id,
		}).where({ isOpen: true });
		if (openOrders) {
			return res.send({
				msg: 'You already have open order',
				order: openOrders._id,
				user: req.session.user._id,
			});
		}
		newOrder = new Order({
			customer: req.session.user._id,
		});

		newOrder.save();
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
	try {
		const order = await Order.findById(req.params.orderId);
		if (!order) {
			return res.status(400).send({ msg: 'Order not found' });
		}
		const { product, quantity } = req.body;
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
		const order = await Order.findById(req.params.orderId).where({
			customer: req.session.user._id,
		});
		if (!order) {
			return res.status(400).send({ msg: 'Order not found' });
		}
		order.products_list = order.products_list.filter(
			(item) => item._id.toString() !== req.params.itemId
		);
		order.save();
		res.send({ msg: `item removed from order ${req.params.orderId} ` });
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

// @Route PUT api/orders/update-item/:orderId/:itemId
// @Desc Update quantity for item
// @Access private
router.put('/update-item/:orderId/:itemId', authUser, async (req, res) => {
	try {
		const order = await Order.findById(req.params.orderId).where({
			customer: req.session.user._id,
		});
		if (!order) {
			return res.status(400).send({ msg: 'Order not found' });
		}
		const itemIndex = order.products_list
			.map((item) => item._id)
			.toString()
			.indexOf(req.params.itemId);
		order.products_list[itemIndex].quantity = parseInt(req.body.quantity);
		order.save();
		res.send({
			msg: `item quantity updated from order ${req.params.orderId} `,
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
		const order = await Order.findByIdAndRemove(req.params.orderId);
		if (!order) {
			return res.status(400).send({ msg: 'No order found' });
		}
		res.send({ msg: `order ${order._id} was deleted` });
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

module.exports = router;
