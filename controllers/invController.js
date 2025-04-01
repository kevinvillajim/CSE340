const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

/* ***************************
 *  Build inventory by classification view
 * ************************** */
const buildByClassificationId = async function (req, res, next) {
	const classification_id = req.params.classificationId;
	const data = await invModel.getInventoryByClassificationId(classification_id);

	// Verificar si hay datos
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

	// Cambio de ruta: eliminando el ./ del inicio
	res.render("inventory/detail", {
		title: makeName + " " + modelName,
		nav,
		vehicleDetail,
	});
};

module.exports = {buildByClassificationId, buildByInventoryId};
