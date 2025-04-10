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

/*  **********************************
 *  Account Update Data Validation Rules
 * ********************************* */
const accountUpdateRules = () => {
	return [
		// firstname is required and must be string
		body("account_firstname")
			.trim()
			.isLength({min: 1})
			.withMessage("Please provide a first name."),

		// lastname is required and must be string
		body("account_lastname")
			.trim()
			.isLength({min: 2})
			.withMessage("Please provide a last name."),

		// valid email is required and cannot already exist in the database unless it belongs to the current account
		body("account_email")
			.trim()
			.isEmail()
			.normalizeEmail()
			.withMessage("A valid email is required.")
			.custom(async (account_email, {req}) => {
				const account_id = req.body.account_id;
				const emailExists = await accountModel.checkExistingEmail(
					account_email
				);
				if (emailExists) {
					// Get account with this email to check if it's the current user's email
					const accountWithEmail = await accountModel.getAccountByEmail(
						account_email
					);
					if (accountWithEmail && accountWithEmail.account_id != account_id) {
						throw new Error(
							"Email already exists. Please use a different email."
						);
					}
				}
				return true;
			}),
	];
};

/*  **********************************
 *  Password Update Validation Rules
 * ********************************* */
const passwordRules = () => {
	return [
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

/* ******************************
 * Check data and return errors or continue for account update
 * ***************************** */
const checkAccountData = async (req, res, next) => {
	const {account_firstname, account_lastname, account_email, account_id} =
		req.body;
	let errors = validationResult(req);
	if (!errors.isEmpty()) {
		let nav = await utilities.getNav();

		const account = {
			account_firstname,
			account_lastname,
			account_email,
			account_id,
		};

		res.render("account/update", {
			errors,
			title: "Update Account",
			nav,
			account,
		});
		return;
	}
	next();
};

/* ******************************
 * Check data and return errors or continue for password update
 * ***************************** */
const checkPasswordData = async (req, res, next) => {
	const {account_id} = req.body;
	let errors = validationResult(req);
	if (!errors.isEmpty()) {
		let nav = await utilities.getNav();

		// Get the account data to repopulate the form
		const account = await accountModel.getAccountById(account_id);

		res.render("account/update", {
			errors,
			title: "Update Account",
			nav,
			account,
		});
		return;
	}
	next();
};

module.exports = {
	registrationRules,
	loginRules,
	accountUpdateRules,
	passwordRules,
	checkRegData,
	checkLoginData,
	checkAccountData,
	checkPasswordData,
};
