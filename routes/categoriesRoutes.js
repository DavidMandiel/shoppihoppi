const router = require('express').Router();
const Category = require('../models/Category');
const isAdmin = require('../middleware/isAdmin');

// @Route GET api/categories
// @Desc get all categories
// @Access private
router.get('/', authUser, async (req, res) => {
	try {
		const categoriesList = await Category.find();

		if (!categoriesList) {
			return res.status(400).send({ msg: 'No categories available' });
		}
		res.send(categoriesList);
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

// @Route GET api/categories/:categoryId
// @Desc get category by id
// @Access private
router.get('/:categoryId', authUser, async (req, res) => {
	try {
		const category = await Category.findById(req.params.categoryId);

		if (!category) {
			return res.status(400).send({ msg: 'No categories available' });
		}
		res.send(category);
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

// @Route POST api/categories/add-category
// @Desc Add new category
// @Access private - ADMIN ONLY
router.post('/add-category', isAdmin, async (req, res) => {
	try {
		const { category_name } = req.body;

		let newCategory = await Category.findOne({ category_name: category_name });

		if (newCategory) {
			return res
				.status(400)
				.send({ msg: 'Category already exist under the same name' });
		}

		newCategory = new Category({
			category_name,
		});

		newCategory.save();
		res.send({ msg: `${newCategory.category_name} added to categories list` });
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

// @Route DELETE api/categories/delete-category/:categoryId
// @Desc delete category by id
// @Access private - ADMIN ONLY
router.delete('/delete-category/:categoryId', isAdmin, async (req, res) => {
	try {
		const category = await Category.findByIdAndRemove(req.params.categoryId);
		if (!category) {
			return res.status(400).send({ msg: 'No category found' });
		}
		res.send({ msg: `category ${category.category_name} was deleted` });
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

// @Route PUT api/categories/update-category/:categoryId
// @Desc update category by id
// @Access private - ADMIN ONLY
router.put('/update-category/:categoryId', isAdmin, async (req, res) => {
	const { category_name } = req.body;
	try {
		const category = await Category.findById(req.params.categoryId);
		if (!category) {
			return res.status(400).send({ msg: 'No category found' });
		}
		if (category_name) {
			category.category_name = category_name;
		}

		await category.save();
		res.send({ msg: `category ${category.category_name} was updated` });
	} catch (err) {
		console.log(err);
		res.status(500).send({ error: 'Server Error' });
	}
});

module.exports = router;
