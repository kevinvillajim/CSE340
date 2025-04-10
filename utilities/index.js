const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
async function getNav() {
	let data = await invModel.getClassifications();
	let list = "<ul>";
	list += '<li class= navItem><a href="/" title="Home page">Home</a></li>';
	data.rows.forEach((row) => {
		list += "<li class= navItem>";
		list +=
			'<a href="/inv/type/' +
			row.classification_id +
			'" title="See our inventory of ' +
			row.classification_name +
			' vehicles">' +
			row.classification_name +
			"</a>";
		list += "</li>";
	});
	list += "</ul>";
	return list;
}

/* **************************************
 * Build the classification view HTML
 * ************************************ */
function buildClassificationGrid(data) {
	let grid;
	if (data.length > 0) {
		grid = '<ul id="inv-display">';
		data.forEach((vehicle) => {
			grid += "<li>";
			grid +=
				'<a href="/inv/detail/' +
				vehicle.inv_id +
				'" title="View ' +
				vehicle.inv_make +
				" " +
				vehicle.inv_model +
				' details">';
			grid +=
				'<img src="' +
				vehicle.inv_thumbnail +
				'" alt="' +
				vehicle.inv_make +
				" " +
				vehicle.inv_model +
				' on CSE Motors">';
			grid += "<hr>";
			grid += "<h2>" + vehicle.inv_make + " " + vehicle.inv_model + "</h2>";
			grid +=
				"<span>$" +
				new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
				"</span>";
			grid += "</a>";
			grid += "</li>";
		});
		grid += "</ul>";
	} else {
		grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
	}
	return grid;
}

/* **************************************
 * Build the vehicle detail view HTML
 * ************************************ */
function buildVehicleDetail(vehicle) {
	let detail = '<div class="vehicle-detail">';
	detail += '<div class="vehicle-image">';
	detail +=
		'<img src="' +
		vehicle.inv_image +
		'" alt="' +
		vehicle.inv_make +
		" " +
		vehicle.inv_model +
		'">';
	detail += "</div>";
	detail += '<div class="vehicle-info">';
	detail +=
		"<h2>" + vehicle.inv_make + " " + vehicle.inv_model + " Details</h2>";
	detail +=
		"<p><strong>Price:</strong> $" +
		new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
		"</p>";
	detail +=
		"<p><strong>Description:</strong> " + vehicle.inv_description + "</p>";
	detail += "<p><strong>Color:</strong> " + vehicle.inv_color + "</p>";
	detail +=
		"<p><strong>Mileage:</strong> " +
		new Intl.NumberFormat("en-US").format(vehicle.inv_miles) +
		"</p>";
	detail += "<p><strong>Year:</strong> " + vehicle.inv_year + "</p>";
	detail += "</div>";
	detail += "</div>";
	return detail;
}

/* **************************************
 * Build the classification select list
 * ************************************ */
async function buildClassificationList(classification_id = null) {
	let data = await invModel.getClassifications();
	let classificationList =
		'<select name="classification_id" id="classificationList" required>';
	classificationList += '<option value="">Choose a Classification</option>';
	data.rows.forEach((row) => {
		classificationList += '<option value="' + row.classification_id + '"';
		if (
			classification_id != null &&
			row.classification_id == classification_id
		) {
			classificationList += " selected ";
		}
		classificationList += ">" + row.classification_name + "</option>";
	});
	classificationList += "</select>";
	return classificationList;
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
function handleErrors(fn) {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}

/* ****************************************
* Middleware to check token validity
**************************************** */
const checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      });
  } else {
    next();
  }
};

/* ****************************************
 *  Check Login
 * ************************************ */
const checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

module.exports = {
	getNav,
	buildClassificationGrid,
	buildVehicleDetail,
	buildClassificationList,
	handleErrors,
	checkJWTToken,
	checkLogin,
};
