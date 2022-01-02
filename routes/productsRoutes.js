const router = require('express').Router();
const Product = require('../models/Product');
const isAdmin = require('../middleware/isAdmin');
const authUser = require('../middleware/authUser');

// @Route GET api/products
// @Desc get all products
// @Access private

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
		// make product name start with capital letter
		const { img, price, stock, category } = req.body;
		let { product_name } = req.body;
		const nameLength = product_name.length;
		const firstPart = product_name.substr(0, 1).toUpperCase();
		const secondPart = product_name.substr(1, nameLength).toLowerCase();
		product_name = firstPart + secondPart;

		let newProduct = await Product.find().where({ product_name: product_name });
		console.log(newProduct.length);
		if (newProduct.length > 0) {
			return res
				.status(400)
				.send({ error: 'Product already exist under the same name' });
		}

		newProduct = new Product({
			product_name,
			img,
			price,
			stock,
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
	const { product_name, img, price, stock, category } = req.body;
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
		if (stock) {
			product.stock = stock;
		}
		if (category) {
			product.category = category._id;
		}
		await product.save();
		res.send({ msg: `Product was updated` });
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

module.exports = router;
