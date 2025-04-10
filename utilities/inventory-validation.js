const {body, validationResult} = require("express-validator");
const utilities = require("./");
const invModel = require("../models/inventory-model");

/*  **********************************
 *  Classification Data Validation Rules
 * ********************************* */
const classificationRules = () => {
	return [
		// classification name must be string, not empty, and only contain letters, numbers
		body("classification_name")
			.trim()
			.isLength({min: 1})
			.withMessage("Please provide a classification name")
			.isAlphanumeric()
			.withMessage(
				"Classification name must contain only letters and numbers (no spaces or special characters)"
			)
			.custom(async (classification_name) => {
				const classificationExists = await invModel.checkExistingClassification(
					classification_name
				);
				if (classificationExists) {
					throw new Error(
						"Classification name already exists. Please use a different name"
					);
				}
				return true;
			}),
	];
};

/*  **********************************
 *  Inventory Data Validation Rules
 * ********************************* */
const inventoryRules = () => {
	return [
		// classification is required
		body("classification_id")
			.trim()
			.isLength({min: 1})
			.withMessage("Please select a classification"),

		// make is required and must be string between 3-20 chars
		body("inv_make")
			.trim()
			.isLength({min: 3})
			.withMessage("Make must be at least 3 characters")
			.isLength({max: 20})
			.withMessage("Make cannot exceed 20 characters")
			.matches(/^[A-Za-z0-9\s]+$/)
			.withMessage("Make must contain only letters, numbers, and spaces"),

		// model is required and must be string between 3-20 chars
		body("inv_model")
			.trim()
			.isLength({min: 3})
			.withMessage("Model must be at least 3 characters")
			.isLength({max: 20})
			.withMessage("Model cannot exceed 20 characters")
			.matches(/^[A-Za-z0-9\s]+$/)
			.withMessage("Model must contain only letters, numbers, and spaces"),

		// description is required
		body("inv_description")
			.trim()
			.isLength({min: 10})
			.withMessage("Description must be at least 10 characters"),

		// image path is required
		body("inv_image")
			.trim()
			.isLength({min: 1})
			.withMessage("Image path is required"),

		// thumbnail path is required
		body("inv_thumbnail")
			.trim()
			.isLength({min: 1})
			.withMessage("Thumbnail path is required"),

		// price is required and must be a valid number
		body("inv_price")
			.trim()
			.isFloat({min: 1})
			.withMessage("Price must be a valid number greater than 0"),

		// year is required and must be a 4-digit number
		body("inv_year")
			.trim()
			.isInt({min: 1950, max: 2024})
			.withMessage("Year must be a 4-digit number, 1950 or newer"),

		// miles is required and must be a valid number
		body("inv_miles")
			.trim()
			.isInt({min: 0})
			.withMessage("Miles must be a valid number, no decimals"),

		// color is required and must be string at least 3 chars
		body("inv_color")
			.trim()
			.isLength({min: 3})
			.withMessage("Color must be at least 3 characters")
			.matches(/^[A-Za-z\s]+$/)
			.withMessage("Color must contain only letters and spaces"),
	];
};

/* ******************************
 * Check Classification Data and return errors or continue
 * ***************************** */
const checkClassificationData = async (req, res, next) => {
	const {classification_name} = req.body;
	let errors = validationResult(req);
	if (!errors.isEmpty()) {
		let nav = await utilities.getNav();
		res.render("inventory/add-classification", {
			errors,
			title: "Add New Classification",
			nav,
			classification_name,
		});
		return;
	}
	next();
};

/* ******************************
 * Check Inventory Data and return errors or continue
 * ***************************** */
const checkInventoryData = async (req, res, next) => {
	const {
		classification_id,
		inv_make,
		inv_model,
		inv_description,
		inv_image,
		inv_thumbnail,
		inv_price,
		inv_year,
		inv_miles,
		inv_color,
	} = req.body;

	let errors = validationResult(req);
	if (!errors.isEmpty()) {
		let nav = await utilities.getNav();
		let classifications = await utilities.buildClassificationList(
			classification_id
		);
		res.render("inventory/add-inventory", {
			errors,
			title: "Add New Vehicle",
			nav,
			classifications,
			classification_id,
			inv_make,
			inv_model,
			inv_description,
			inv_image,
			inv_thumbnail,
			inv_price,
			inv_year,
			inv_miles,
			inv_color,
		});
		return;
	}
	next();
};

module.exports = {
	classificationRules,
	inventoryRules,
	checkClassificationData,
	checkInventoryData,
};
