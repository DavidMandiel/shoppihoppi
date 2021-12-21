const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
	pname: {
		type: String,
		required: true,
	},
	fname: {
		type: String,
		required: true,
	},
	social_no: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	avatar: {
		type: String,
	},
	orders: [
		{
			type: mongoose.Types.ObjectId,
			ref: 'order',
		},
	],
	membership_date: {
		type: Date,
		default: Date.now,
	},
	address: {
		street: { type: String },
		number: { type: String },
		apartment: { type: String },
		city: { type: String },
	},
	role: { type: String, required: true, default: 'customer' },
});

module.exports = User = mongoose.model('user', UserSchema);
