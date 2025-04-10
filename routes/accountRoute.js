const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const regValidate = require("../utilities/account-validation");

// Route to deliver login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to deliver registration view
router.get(
	"/register",
	utilities.handleErrors(accountController.buildRegister)
);

// Route to deliver account management view
router.get(
	"/",
	utilities.checkLogin,
	utilities.handleErrors(accountController.buildAccountManagement)
);

// Process registration
router.post(
	"/register",
	regValidate.registrationRules(),
	regValidate.checkRegData,
	utilities.handleErrors(accountController.registerAccount)
);

// Process the login request
router.post(
	"/login",
	regValidate.loginRules(),
	regValidate.checkLoginData,
	utilities.handleErrors(accountController.accountLogin)
);

module.exports = router;
