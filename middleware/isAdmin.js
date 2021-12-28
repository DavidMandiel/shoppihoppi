module.exports = isAdmin = (req, res, next) => {
	if (!req.session.user) {
		return res.status(401).send({ err: 'You need to login' });
	}
	if (req.session.user.role !== 'admin') {
		return res
			.status(401)
			.send({ err: 'Only admin can modify or add products' });
	}
	next();
};
