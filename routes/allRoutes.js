const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const templateController = require('../controllers/templateController');
const checklistController = require('../controllers/checklistController');
const itemController = require('../controllers/itemController');


router.post('/login', authController.login);
router.post('/signup', authController.signup);

// Protect all routes after this middleware
router.use(authController.protect);

router
    .post('/checklists/templates', templateController.create)
    .get('/checklists/templates', templateController.listAllChecklistTemplate)
    .route('/checklists/templates/:templateId/')
        .get(templateController.getTemplate)
        .patch(templateController.updateTemplate)
        .delete(templateController.deleteTemplate);
router
    //Assign a checklists template by given templateId to a domains
    // .post('/checklists/templates/:templateId/assigns', templateController.create)
    ;
    //Assign bulk checklists template by given templateId to many domains

//checklist 
router
    .post('/checklists', checklistController.create)
    .get('/checklists', checklistController.listListChecklist)
    .route('/checklists/:checklistId')
        .get(checklistController.getChecklist)
        .patch(checklistController.updateChecklist)
        .delete(checklistController.deleteChecklist);

// item
router
    .post('/checklists/:checklistId/items', itemController.create)
    .get('/checklists/:checklistId/items', itemController.listAllItemChecklist)
    .route('/checklists/:checklistId/items/:itemId')
        .get(itemController.getItem)
        .patch(itemController.updateItem)
        .delete(itemController.deleteItem)
    ;
router
    .post('/checklists/:checklistId/items_bulk', itemController.updateBulkChecklist)
    .get('/checklists/items/summaries', itemController.sumaryItem)
    .get('/checklistss/items', itemController.listListItem)
    .post('/checklistsc/complete', itemController.completeItem)
    .post('/checklistsi/incomplete', itemController.inCompleteItem)




module.exports = router;