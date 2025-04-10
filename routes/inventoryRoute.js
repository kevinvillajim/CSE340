const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const {body, validationResult} = require("express-validator");
const validate = require("../utilities/inventory-validation");

// Route to inventory management view
router.get("/", utilities.handleErrors(invController.buildManagementView));

// Route to build inventory by classification view
router.get(
	"/type/:classificationId",
	utilities.handleErrors(invController.buildByClassificationId)
);

// Route to build the detail view
router.get(
	"/detail/:inventoryId",
	utilities.handleErrors(invController.buildByInventoryId)
);

// Route to build add classification view
router.get(
	"/add-classification",
	utilities.handleErrors(invController.buildAddClassificationView)
);

// Route to process add classification
router.post(
	"/add-classification",
	validate.classificationRules(),
	validate.checkClassificationData,
	utilities.handleErrors(invController.addClassification)
);

// Route to build add inventory view
router.get(
	"/add-inventory",
	utilities.handleErrors(invController.buildAddInventoryView)
);

// Route to process add inventory
router.post(
	"/add-inventory",
	validate.inventoryRules(),
	validate.checkInventoryData,
	utilities.handleErrors(invController.addInventory)
);

module.exports = router;
