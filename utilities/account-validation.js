const {body, validationResult} = require("express-validator");
const accountModel = require("../models/account-model");
const utilities = require("./");

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
const registrationRules = () => {
	return [
		// firstname is required and must be string
		body("account_firstname")
			.trim()
			.isLength({min: 1})
			.withMessage("Please provide a first name."), // on error this message is sent.

		// lastname is required and must be string
		body("account_lastname")
			.trim()
			.isLength({min: 2})
			.withMessage("Please provide a last name."), // on error this message is sent.

		// valid email is required and cannot already exist in the database
		body("account_email")
			.trim()
			.isEmail()
			.normalizeEmail() // refer to validator.js docs
			.withMessage("A valid email is required.")
			.custom(async (account_email) => {
				const emailExists = await accountModel.checkExistingEmail(
					account_email
				);
				if (emailExists) {
					throw new Error(
						"Email already exists. Please log in or use a different email."
					);
				}
				return true;
			}),

		// password is required and must be at least 12 characters, include uppercase, lowercase, number, and special character
		body("account_password")
			.trim()
			.isStrongPassword({
				minLength: 12,
				minLowercase: 1,
				minUppercase: 1,
				minNumbers: 1,
				minSymbols: 1,
			})
			.withMessage("Password does not meet requirements."),
	];
};

/*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
const loginRules = () => {
	return [
		// valid email is required
		body("account_email")
			.trim()
			.isEmail()
			.normalizeEmail() // refer to validator.js docs
			.withMessage("A valid email is required."),

		// password is required
		body("account_password")
			.trim()
			.isLength({min: 1})
			.withMessage("Password is required."),
	];
};

/* ******************************
 * Check data and return errors or continue
 * ***************************** */
const checkRegData = async (req, res, next) => {
	const {account_firstname, account_lastname, account_email} = req.body;
	let errors = validationResult(req);
	if (!errors.isEmpty()) {
		let nav = await utilities.getNav();
		res.render("account/register", {
			errors,
			title: "Registration",
			nav,
			account_firstname,
			account_lastname,
			account_email,
		});
		return;
	}
	next();
};

/* ******************************
 * Check data and return errors or continue for login
 * ***************************** */
const checkLoginData = async (req, res, next) => {
	const {account_email} = req.body;
	let errors = validationResult(req);
	if (!errors.isEmpty()) {
		let nav = await utilities.getNav();
		res.render("account/login", {
			errors,
			title: "Login",
			nav,
			account_email,
		});
		return;
	}
	next();
};

module.exports = {
	registrationRules,
	loginRules,
	checkRegData,
	checkLoginData,
};
