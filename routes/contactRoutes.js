const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Export endpoints (placed before :id to prevent collision)
router.get('/export/csv', contactController.exportCSV);
router.get('/export/vcf', contactController.exportVCF);
router.post('/import', contactController.importContacts);

// Statistics endpoint
router.get('/stats', contactController.getStats);

// Standard CRUD endpoints
router.get('/', contactController.getAllContacts);
router.get('/:id', contactController.getContactById);
router.post('/', contactController.createContact);
router.put('/:id', contactController.updateContact);
router.patch('/:id/favorite', contactController.toggleFavorite);
router.delete('/:id', contactController.deleteContact);

module.exports = router;
