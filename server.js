/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities/");
const errorHandler = require("./middleware/errorHandler");

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static);
app.use("/inv", inventoryRoute);

// Index route
app.get(
	"/",
	utilities.handleErrors(async (req, res) => {
		let nav = await utilities.getNav();
		res.render("index", {
			title: "Home",
			nav,
		});
	})
);

// Trigger Intentional Error Route
app.get(
	"/trigger-error",
	utilities.handleErrors(async (req, res) => {
		throw new Error("Intentional 500 Error");
	})
);

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
	next({status: 404, message: "Not found"});
});

/* ***********************
 * Express Error Handler
 *************************/
app.use(errorHandler.handleError);

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
	console.log(`app listening on ${host}:${port}`);
});
