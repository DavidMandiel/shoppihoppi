const express = require('express');
const cors = require('cors');
const session = require('express-session');
const dbConnection = require('./dbConnection');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;
dbConnection();

const usersRoutes = require('./routes/usersRoutes');
const productsRoutes = require('./routes/productsRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const categoriesRoutes = require('./routes/categoriesRoutes');

// Middlewares
app.use(express.json({ extended: false }));
app.use(
	cors({
		origin: 'http://localhost:4200',
		credentials: true,
		methods: ['GET', 'POST', 'DELETE', 'PUT', 'UPDATE'],
	})
);

app.use(
	session({
		name: '',
		secret: process.env.SESSION_SECRET,
		resave: true,
		saveUninitialized: true,
		cookie: {
			maxAge: 60 * 1000 * 60,
		},
	})
);
app.use(express.static('build'));

// Routes
app.get('/', (req, res) => {
	res.send('Welcome to ShoppiHoppi API');
});
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/orders', ordersRoutes);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}...`);
});
