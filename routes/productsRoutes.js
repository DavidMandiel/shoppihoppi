const router = require('express').Router();
const Product = require('../models/Product');
const isAdmin = require('../middleware/isAdmin');
const authUser = require('../middleware/authUser');

// @Route GET api/products
// @Desc get all products
// @Access private
// TODO - add auth user to route
router.get('/', async (req, res) => {
	try {
		const productsList = await Product.find()
			.sort('product_name')
			.populate('category');

		if (!productsList) {
			return res.status(400).send({ msg: 'No Products available' });
		}
		res.send(productsList);
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

// @Route GET api/products/:productId
// @Desc get product by id
// @Access private
router.get('/:productId', authUser, async (req, res) => {
	try {
		const product = await Product.findById(req.params.productId).populate(
			'category'
		);

		if (!product) {
			return res.status(400).send({ msg: 'No Products available' });
		}
		res.send(product);
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

// @Route POST api/products/add-product
// @Desc Add new product
// @Access private - ADMIN ONLY
router.post('/add-product', isAdmin, async (req, res) => {
	try {
		const { product_name, img, price, quantity, category } = req.body;
		let newProduct = await Product.findOne({ product_name: product_name });

		if (newProduct) {
			return res
				.status(400)
				.send({ msg: 'Product already exist under the same name' });
		}

		newProduct = new Product({
			product_name,
			img,
			price,
			quantity,
			category,
		});

		newProduct.save();
		res.send({ msg: `${newProduct.product_name} add to products list` });
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

// @Route DELETE api/products/delete-product/:productId
// @Desc delete product by id
// @Access private - ADMIN ONLY
router.delete('/delete-product/:productId', isAdmin, async (req, res) => {
	try {
		const product = await Product.findByIdAndRemove(req.params.productId);
		if (!product) {
			return res.status(400).send({ msg: 'No Product found' });
		}
		res.send({ msg: `Product ${product.product_name} was deleted` });
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

// @Route PUT api/products/update-product/:productId
// @Desc update product by id
// @Access private - ADMIN ONLY
router.put('/update-product/:productId', isAdmin, async (req, res) => {
	const { product_name, img, price, quantity, category } = req.body;
	try {
		const product = await Product.findById(req.params.productId);
		if (!product) {
			return res.status(400).send({ msg: 'No Product found' });
		}
		if (product_name) {
			product.product_name = product_name;
		}
		if (img) {
			product.img = img;
		}
		if (price) {
			product.price = price;
		}
		if (quantity) {
			product.quantity = quantity;
		}
		if (category) {
			product.category = category;
		}

		await product.save();
		res.send({ msg: `Product ${product.product_name} was updated` });
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

module.exports = router;
