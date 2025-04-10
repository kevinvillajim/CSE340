const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
	let nav = await utilities.getNav();
	res.render("account/login", {
		title: "Login",
		nav,
		errors: null,
	});
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
	let nav = await utilities.getNav();
	res.render("account/register", {
		title: "Register",
		nav,
		errors: null,
	});
}


/* ****************************************
 *  Deliver account management view
 * *************************************** */
async function buildAccountManagement(req, res, next) {
	let nav = await utilities.getNav();
	res.render("account/management", {
		title: "Account Management",
		nav,
		errors: null,
	});
}

/* ****************************************
 *  Deliver account update view
 * *************************************** */
async function buildAccountUpdate(req, res, next) {
	let nav = await utilities.getNav();
	const account_id = parseInt(req.params.account_id);

	// If account_id in params doesn't match logged in user, redirect
	if (account_id !== res.locals.accountData.account_id) {
		req.flash("notice", "You are not authorized to update this account");
		return res.redirect("/account/");
	}

	// Get account data
	const account = await accountModel.getAccountById(account_id);

	if (!account) {
		req.flash("notice", "Account not found");
		return res.redirect("/account/");
	}

	res.render("account/update", {
		title: "Update Account",
		nav,
		errors: null,
		account,
	});
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
	let nav = await utilities.getNav();
	const {account_firstname, account_lastname, account_email, account_password} =
		req.body;

	// Hash the password before storing
	let hashedPassword;
	try {
		// Regular password and cost (salt is generated automatically)
		hashedPassword = await bcrypt.hash(account_password, 10);
	} catch (error) {
		console.error("Error hashing password:", error);
		req.flash(
			"notice",
			"Sorry, there was an error processing the registration."
		);
		res.status(500).render("account/register", {
			title: "Registration",
			nav,
			errors: null,
			account_firstname,
			account_lastname,
			account_email,
		});
		return;
	}

	try {
		const regResult = await accountModel.registerAccount(
			account_firstname,
			account_lastname,
			account_email,
			hashedPassword
		);

		if (regResult) {
			req.flash(
				"success",
				`Congratulations, you\'re registered ${account_firstname}. Please log in.`
			);
			res.status(201).render("account/login", {
				title: "Login",
				nav,
				errors: null,
			});
		} else {
			req.flash("notice", "Sorry, the registration failed.");
			res.status(501).render("account/register", {
				title: "Registration",
				nav,
				errors: null,
				account_firstname,
				account_lastname,
				account_email,
			});
		}
	} catch (error) {
		console.error("Error in registerAccount:", error);
		req.flash(
			"notice",
			"Sorry, there was an error processing the registration."
		);
		res.status(500).render("account/register", {
			title: "Registration",
			nav,
			errors: null,
			account_firstname,
			account_lastname,
			account_email,
		});
	}
}

/* ****************************************
 *  Process login request
 * ************************************ */

async function accountLogin(req, res) {
	let nav = await utilities.getNav();
	const {account_email, account_password} = req.body;

	try {
		// Verificar que los campos no estén vacíos
		if (!account_email || !account_password) {
			req.flash("notice", "Please provide both email and password");
			return res.status(400).render("account/login", {
				title: "Login",
				nav,
				errors: null,
				account_email,
			});
		}

		const accountData = await accountModel.getAccountByEmail(account_email);

		if (!accountData) {
			req.flash("notice", "Please check your credentials and try again.");
			return res.status(400).render("account/login", {
				title: "Login",
				nav,
				errors: null,
				account_email,
			});
		}

		const passwordMatch = await bcrypt.compare(
			account_password,
			accountData.account_password
		);

		if (passwordMatch) {
			delete accountData.account_password;
			const accessToken = jwt.sign(
				accountData,
				process.env.ACCESS_TOKEN_SECRET,
				{expiresIn: 3600 * 1000}
			);

			if (process.env.NODE_ENV === "development") {
				res.cookie("jwt", accessToken, {httpOnly: true, maxAge: 3600 * 1000});
			} else {
				res.cookie("jwt", accessToken, {
					httpOnly: true,
					secure: true,
					maxAge: 3600 * 1000,
				});
			}

			req.flash("success", "You have successfully logged in");

			return res.redirect("/account/");
		} else {
			req.flash("notice", "Please check your credentials and try again.");
			return res.status(400).render("account/login", {
				title: "Login",
				nav,
				errors: null,
				account_email,
			});
		}
	} catch (error) {
		console.error("Login error:", error);
		req.flash("notice", "An error occurred during login");
		return res.status(500).render("account/login", {
			title: "Login",
			nav,
			errors: null,
			account_email,
		});
	}
}

/* ****************************************
 *  Process Account Update
 * *************************************** */
async function updateAccount(req, res, next) {
	let nav = await utilities.getNav();
	const {account_id, account_firstname, account_lastname, account_email} =
		req.body;

	// Verify account_id in body matches the logged in user
	if (parseInt(account_id) !== res.locals.accountData.account_id) {
		req.flash("notice", "You are not authorized to update this account");
		return res.redirect("/account/");
	}

	// Check if email already exists and is not the current user's email
	if (account_email !== res.locals.accountData.account_email) {
		const emailExists = await accountModel.checkExistingEmail(account_email);
		if (emailExists) {
			req.flash(
				"notice",
				"Email already exists. Please use a different email."
			);
			const account = await accountModel.getAccountById(account_id);
			return res.render("account/update", {
				title: "Update Account",
				nav,
				errors: null,
				account,
			});
		}
	}

	// Update the account
	const updateResult = await accountModel.updateAccount(
		account_id,
		account_firstname,
		account_lastname,
		account_email
	);

	if (updateResult) {
		// Create a new JWT with updated info
		const updatedAccountData = await accountModel.getAccountById(account_id);
		const accessToken = jwt.sign(
			updatedAccountData,
			process.env.ACCESS_TOKEN_SECRET,
			{expiresIn: 3600 * 1000}
		);

		if (process.env.NODE_ENV === "development") {
			res.cookie("jwt", accessToken, {httpOnly: true, maxAge: 3600 * 1000});
		} else {
			res.cookie("jwt", accessToken, {
				httpOnly: true,
				secure: true,
				maxAge: 3600 * 1000,
			});
		}

		req.flash("success", "Account information updated successfully");
		return res.redirect("/account/");
	} else {
		req.flash("error", "Account update failed. Please try again.");
		const account = await accountModel.getAccountById(account_id);
		return res.render("account/update", {
			title: "Update Account",
			nav,
			errors: null,
			account,
		});
	}
}

/* ****************************************
 *  Process Password Update
 * *************************************** */
async function updatePassword(req, res, next) {
	let nav = await utilities.getNav();
	const {account_id, account_password} = req.body;

	// Verify account_id in body matches the logged in user
	if (parseInt(account_id) !== res.locals.accountData.account_id) {
		req.flash("notice", "You are not authorized to update this account");
		return res.redirect("/account/");
	}

	// Hash the new password
	let hashedPassword;
	try {
		hashedPassword = await bcrypt.hashSync(account_password, 10);
	} catch (error) {
		req.flash("error", "There was an error processing the password update.");
		const account = await accountModel.getAccountById(account_id);
		return res.render("account/update", {
			title: "Update Account",
			nav,
			errors: null,
			account,
		});
	}

	// Update the password
	const updateResult = await accountModel.updatePassword(
		account_id,
		hashedPassword
	);

	if (updateResult) {
		req.flash("success", "Password updated successfully");
		return res.redirect("/account/");
	} else {
		req.flash("error", "Password update failed. Please try again.");
		const account = await accountModel.getAccountById(account_id);
		return res.render("account/update", {
			title: "Update Account",
			nav,
			errors: null,
			account,
		});
	}
}

/* ****************************************
 *  Process Logout
 * *************************************** */
async function accountLogout(req, res, next) {
	try {
		res.clearCookie("jwt");
		req.flash("success", "You have been successfully logged out");
		return res.redirect("/");
	} catch (error) {
		console.error("Logout error:", error);
		req.flash("error", "Error during logout");
		return res.redirect("/");
	}
}

module.exports = {
	buildLogin,
	buildRegister,
	registerAccount,
	accountLogin,
	buildAccountManagement,
	buildAccountUpdate,
	updateAccount,
	updatePassword,
	accountLogout,
};
