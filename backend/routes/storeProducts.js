const express = require('express');
const router = express.Router();
const { getProducts, getProduct, getProductBySlug, getFeaturedProducts, getCategories, getTrendingProducts } = require('../controllers/productController');

router.get('/categories', getCategories);
router.get('/trending', getTrendingProducts);
router.get('/featured', getFeaturedProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/', getProducts);
router.get('/:slug', getProduct);

module.exports = router;
