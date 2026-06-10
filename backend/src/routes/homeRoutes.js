const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

router.get('/', homeController.getHomeData);
router.get('/search', homeController.search);
router.get('/config', homeController.getConfig);
router.get('/agreement/:type', homeController.getAgreement);
router.get('/qualifications', homeController.getQualifications);

router.get('/recipes', homeController.getRecipes);
router.get('/recipes/:id', homeController.getRecipeDetail);

module.exports = router;
