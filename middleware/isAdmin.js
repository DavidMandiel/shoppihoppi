module.exports = isAdmin = (req, res, next) => {
	if (!req.session.user) {
		return res.status(401).send({ error: 'You need to login' });
	}
	if (req.session.user.role !== 'admin') {
		return res
			.status(401)
			.send({ error: 'Only admin can modify or add products' });
	}
	next();
};
