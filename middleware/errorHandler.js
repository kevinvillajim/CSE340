const utilities = require("../utilities/");

/* ****************************************
 *  Error handler
 * *************************************** */
const handleError = async (err, req, res, next) => {
	let nav = await utilities.getNav();
	console.error(`Error at: "${req.originalUrl}": ${err.message}`);

	if (err.status == 404) {
		message = "Oh no! The page you were looking for was not found.";
		res.status(404).render("errors/error", {
			title: "404 - Page Not Found",
			message,
			nav,
		});
	} else {
		message = "Oh no! There was a server error.";
		res.status(500).render("errors/error", {
			title: "500 - Server Error",
			message,
			nav,
		});
	}
};

module.exports = {handleError};
