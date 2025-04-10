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
const accountRoute = require("./routes/accountRoute");
const utilities = require("./utilities/");
const errorHandler = require("./middleware/errorHandler");
const session = require("express-session");
const pool = require("./db/pool");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
const flash = require("connect-flash");

/* ***********************
 * Middleware
 *************************/
app.use(
	session({
		secret: process.env.SESSION_SECRET || "your_secret_key",
		resave: false,
		saveUninitialized: true,
		cookie: {secure: false}, // during development only
	})
);

// Express Messages Middleware
app.use(flash());
app.use(function (req, res, next) {
	res.locals.messages = function () {
		return req.flash();
	};
	next();
});

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));

//Cookie Parser Middleware
app.use(cookieParser());

//JWT Checking Middleware
app.use(utilities.checkJWTToken);

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
app.use("/account", accountRoute);

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
	console.log(require("crypto").randomBytes(64).toString("hex"));
	console.log(require("crypto").randomBytes(64).toString("hex"));
});
