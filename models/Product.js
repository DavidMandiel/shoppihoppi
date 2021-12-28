const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({
	product_name: {
		type: String,
		required: true,
	},
	img: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	stock: {
		type: Number,
		required: true,
	},

	category: {
		type: mongoose.Types.ObjectId,
		ref: 'category',
	},
});

module.exports = Product = mongoose.model('product', ProductSchema);
