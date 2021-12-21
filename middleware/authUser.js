module.exports = authUser = (req, res, next) => {
	if (!req.session.user) {
		return res.status(401).send({ err: 'You need to logging' });
	}
	next();
};
