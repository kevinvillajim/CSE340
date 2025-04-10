const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

/* ***************************
 *  Build inventory by classification view
 * ************************** */
const buildByClassificationId = async function (req, res, next) {
	const classification_id = req.params.classificationId;
	const data = await invModel.getInventoryByClassificationId(classification_id);

	if (!data || data.length === 0) {
		const err = new Error("No vehicles found with that classification");
		err.status = 404;
		return next(err);
	}

	const grid = await utilities.buildClassificationGrid(data);
	let nav = await utilities.getNav();
	const className = data[0].classification_name;

	// Cambio de ruta: eliminando el ./ del inicio
	res.render("inventory/classification", {
		title: className + " vehicles",
		nav,
		grid,
	});
};

/* ***************************
 *  Build inventory by detail view
 * ************************** */
const buildByInventoryId = async function (req, res, next) {
	const inventory_id = req.params.inventoryId;
	const data = await invModel.getInventoryById(inventory_id);
	if (!data) {
		const err = new Error("Vehicle not found");
		err.status = 404;
		return next(err);
	}
	const vehicleDetail = await utilities.buildVehicleDetail(data);
	let nav = await utilities.getNav();
	const makeName = data.inv_make;
	const modelName = data.inv_model;

	res.render("inventory/detail", {
		title: makeName + " " + modelName,
		nav,
		vehicleDetail,
	});
};

/* ***************************
 *  Build inventory management view
 * ************************** */
const buildManagementView = async function (req, res, next) {
	let nav = await utilities.getNav();

	res.render("inventory/management", {
		title: "Vehicle Management",
		nav,
		errors: null,
	});
};

/* ***************************
 *  Build add classification view
 * ************************** */
const buildAddClassificationView = async function (req, res, next) {
	let nav = await utilities.getNav();

	res.render("inventory/add-classification", {
		title: "Add New Classification",
		nav,
		errors: null,
	});
};

/* ***************************
 *  Process Add Classification
 * ************************** */
const addClassification = async function (req, res, next) {
	let nav = await utilities.getNav();
	const {classification_name} = req.body;

	try {
		const regResult = await invModel.addClassification(classification_name);

		if (regResult) {
			req.flash(
				"success",
				`The ${classification_name} classification was successfully added.`
			);
			// Update navbar with new classification
			nav = await utilities.getNav();
			res.status(201).render("inventory/management", {
				title: "Vehicle Management",
				nav,
				errors: null,
			});
		} else {
			req.flash("error", "Failed to add new classification. Please try again.");
			res.status(501).render("inventory/add-classification", {
				title: "Add New Classification",
				nav,
				errors: null,
			});
		}
	} catch (error) {
		console.error("addClassification error: " + error);
		req.flash("error", "Server error. Please try again.");
		res.status(500).render("inventory/add-classification", {
			title: "Add New Classification",
			nav,
			errors: null,
		});
	}
};

/* ***************************
 *  Build add inventory view
 * ************************** */
const buildAddInventoryView = async function (req, res, next) {
	let nav = await utilities.getNav();
	let classifications = await utilities.buildClassificationList();

	res.render("inventory/add-inventory", {
		title: "Add New Vehicle",
		nav,
		classifications,
		errors: null,
	});
};

/* ***************************
 *  Process Add Inventory
 * ************************** */
const addInventory = async function (req, res, next) {
	let nav = await utilities.getNav();
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

	try {
		const regResult = await invModel.addInventory(
			classification_id,
			inv_make,
			inv_model,
			inv_description,
			inv_image,
			inv_thumbnail,
			inv_price,
			inv_year,
			inv_miles,
			inv_color
		);

		if (regResult) {
			req.flash(
				"success",
				`The ${inv_make} ${inv_model} was successfully added.`
			);
			res.status(201).render("inventory/management", {
				title: "Vehicle Management",
				nav,
				errors: null,
			});
		} else {
			req.flash("error", "Failed to add new vehicle. Please try again.");
			let classifications = await utilities.buildClassificationList(
				classification_id
			);
			res.status(501).render("inventory/add-inventory", {
				title: "Add New Vehicle",
				nav,
				classifications,
				errors: null,
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
		}
	} catch (error) {
		console.error("addInventory error: " + error);
		req.flash("error", "Server error. Please try again.");
		let classifications = await utilities.buildClassificationList(
			classification_id
		);
		res.status(500).render("inventory/add-inventory", {
			title: "Add New Vehicle",
			nav,
			classifications,
			errors: null,
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
	}
};

module.exports = {
	buildByClassificationId,
	buildByInventoryId,
	buildManagementView,
	buildAddClassificationView,
	addClassification,
	buildAddInventoryView,
	addInventory,
};
