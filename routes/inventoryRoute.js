const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const {body, validationResult} = require("express-validator");
const validate = require("../utilities/inventory-validation");

// Route to inventory management view (restricted)
router.get(
	"/",
	utilities.checkAdmin,
	utilities.handleErrors(invController.buildManagementView)
);

// Route to build inventory by classification view (public)
router.get(
	"/type/:classificationId",
	utilities.handleErrors(invController.buildByClassificationId)
);

// Route to build the detail view (public)
router.get(
	"/detail/:inventoryId",
	utilities.handleErrors(invController.buildByInventoryId)
);

// Route to build add classification view (restricted)
router.get(
	"/add-classification",
	utilities.checkAdmin,
	utilities.handleErrors(invController.buildAddClassificationView)
);

// Route to process add classification (restricted)
router.post(
	"/add-classification",
	utilities.checkAdmin,
	validate.classificationRules(),
	validate.checkClassificationData,
	utilities.handleErrors(invController.addClassification)
);

// Route to build add inventory view (restricted)
router.get(
	"/add-inventory",
	utilities.checkAdmin,
	utilities.handleErrors(invController.buildAddInventoryView)
);

// Route to process add inventory (restricted)
router.post(
	"/add-inventory",
	utilities.checkAdmin,
	validate.inventoryRules(),
	validate.checkInventoryData,
	utilities.handleErrors(invController.addInventory)
);

module.exports = router;
