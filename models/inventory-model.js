const pool = require("../database/index");

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

module.exports = {
	getClassifications,
	getInventoryByClassificationId,
	getInventoryById,
};
