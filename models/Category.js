const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema({
	category_name: {
		type: String,
		required: true,
	},
});

module.exports = Category = mongoose.model('category', CategorySchema);
