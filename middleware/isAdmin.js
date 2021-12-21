module.exports = isAdmin = (req, res, next) => {
	console.log(req.session);
	if (req.session.user.role !== 'admin') {
		return res
			.status(401)
			.send({ err: 'Only admin can modify or add products' });
	}
	next();
};
