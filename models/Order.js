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
	shipping_date: { type: Date },
	shipping_address: {
		city: { type: String },
		street: { type: String },
		number: { type: String },
	},
});

module.exports = Order = mongoose.model('order', OrderSchema);
