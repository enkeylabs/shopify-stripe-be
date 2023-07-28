const { Router } = require('express');
const shopifyController = require('../controllers/shopify');

const router = Router();

router.get('/ping', (req, res) => {
  return res.status(200).json('Pong!').end();
});

router.use('/shopify', shopifyController);

module.exports = router;