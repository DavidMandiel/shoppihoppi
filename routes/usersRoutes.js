const router = require('express').Router();
const User = require('../models/User');
const authUser = require('../middleware/authUser');
const bcrypt = require('bcryptjs');

// @Route POST api/users/register-customer
// @Desc register new customer
// @Access public
router.post('/register', async (req, res) => {
	try {
		const { pname, fname, social_no, email, avatar, address, role } = req.body;
		let password = req.body.password;
		let newCustomer = await User.findOne({ social_no: social_no });

		if (newCustomer) {
			return res
				.status(400)
				.send({ error: 'You are already registered, please login' });
		}
		const salt = await bcrypt.genSalt(10);
		password = await bcrypt.hash(password, salt);
		newCustomer = new User({
			pname,
			fname,
			social_no,
			email,
			password,
			role,
			avatar,
			address,
		});
		newCustomer.save();
		req.session.user = newCustomer;
		res.send({ msg: 'You are register, Happy shopping' });
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

// @Route POST api/users/login
// @Desc login user
// @Access public
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		let user = await User.findOne({ email: email }).populate({
			path: 'orders',
			model: 'order',
			options: { sort: [{ date_created: -1 }] },
			populate: {
				model: 'product',
				path: 'products_list.product',
				populate: {
					path: 'category',
					model: 'category',
				},
			},
		});

		if (!user) {
			return res.status(401).send({ error: 'Invalid Credentials' });
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).send({ error: 'Invalid Credentials' });
		}
		user.password = '';
		req.session.user = user;
		res.send({
			msg:
				user.role === 'customer'
					? 'You are logged-in, Happy shopping'
					: 'You are logged as admin, have a nice work',
			user: user,
		});
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});
// @Route GET api/users/reload
// @Desc reload user
// @Access private
router.get('/reload', authUser, async (req, res) => {
	try {
		let user = await User.findById(req.session.user._id).populate({
			path: 'orders',
			model: 'order',
			options: { sort: [{ date_created: -1 }] },
			populate: {
				model: 'product',
				path: 'products_list.product',
				populate: {
					path: 'category',
					model: 'category',
				},
			},
		});

		if (!user) {
			return res.status(401).send({ error: 'You need to loggin' });
		}
		req.session.user = user;
		res.send(user);
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

// @Route DELETE api/users/logout
// @Desc log user
// @Access private
router.delete('/logout', authUser, (req, res) => {
	req.session.destroy();
	res.send({ msg: 'Thanks for shopping with us, you are logged out' });
});
// TODO - add update details route and avatar
module.exports = router;
