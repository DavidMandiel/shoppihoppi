const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
	customer: { type: mongoose.Types.ObjectId, ref: 'user' },
	products_list: [
		{
			product: { type: mongoose.Types.ObjectId, ref: 'product' },
			quantity: { type: Number, default: 1 },
		},
	],
	date_created: { type: Date, default: Date.now() },
	isOpen: { type: Boolean, default: true },
	total_cost: { type: Number, default: 0 },
});

module.exports = Order = mongoose.model('order', OrderSchema);
