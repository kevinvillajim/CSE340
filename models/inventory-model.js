const pool = require("../db/pool");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
	return await pool.query(
		"SELECT * FROM public.classification ORDER BY classification_name"
	);
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
	try {
		console.log("Buscando vehículos con classification_id:", classification_id);

		const data = await pool.query(
			"SELECT * FROM public.inventory AS i JOIN public.classification AS c ON i.classification_id = c.classification_id WHERE i.classification_id = $1",
			[classification_id]
		);

		console.log("Datos encontrados:", data.rows.length);

		return data.rows;
	} catch (error) {
		console.error("getInventoryByClassificationId error:", error);
		throw error; // Propagar el error para que se maneje correctamente
	}
}

/* ***************************
 *  Get inventory item by inventory_id
 * ************************** */
async function getInventoryById(inventory_id) {
	try {
		console.log("Buscando vehículo con inventory_id:", inventory_id);

		const data = await pool.query(
			"SELECT * FROM public.inventory WHERE inv_id = $1",
			[inventory_id]
		);

		console.log("Vehículo encontrado:", data.rows.length > 0);

		return data.rows[0];
	} catch (error) {
		console.error("getInventoryById error:", error);
		throw error; // Propagar el error para que se maneje correctamente
	}
}

/* ***************************
 *  Check for existing classification
 * ************************** */
async function checkExistingClassification(classification_name) {
	try {
		const sql =
			"SELECT * FROM public.classification WHERE classification_name = $1";
		const data = await pool.query(sql, [classification_name]);
		return data.rows.length > 0;
	} catch (error) {
		console.error("checkExistingClassification error:", error);
		throw error;
	}
}

/* ***************************
 *  Add new classification
 * ************************** */
async function addClassification(classification_name) {
	try {
		console.log("Adding new classification:", classification_name);

		const sql =
			"INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *";
		const data = await pool.query(sql, [classification_name]);

		console.log("Classification added:", data.rows[0]);
		return data.rows[0];
	} catch (error) {
		console.error("addClassification error:", error);
		return null;
	}
}

/* ***************************
 *  Add new inventory item
 * ************************** */
async function addInventory(
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
) {
	try {
		console.log("Adding new inventory item:", inv_make, inv_model);

		const sql =
			"INSERT INTO public.inventory (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *";

		const data = await pool.query(sql, [
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
		]);

		console.log("Inventory item added:", data.rows[0]);
		return data.rows[0];
	} catch (error) {
		console.error("addInventory error:", error);
		return null;
	}
}

module.exports = {
	getClassifications,
	getInventoryByClassificationId,
	getInventoryById,
	checkExistingClassification,
	addClassification,
	addInventory,
};
