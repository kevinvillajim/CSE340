const pool = require("../db/pool");
const bcrypt = require("bcryptjs");

/* *****************************
 * Register new account
 * ***************************** */
async function registerAccount(
	account_firstname,
	account_lastname,
	account_email,
	account_password
) {
	try {
		// Hash the password before storing
		const hashedPassword = await bcrypt.hashSync(account_password, 10);

		const sql =
			"INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";

		const data = await pool.query(sql, [
			account_firstname,
			account_lastname,
			account_email,
			hashedPassword,
		]);

		return data.rows[0];
	} catch (error) {
		console.error("registerAccount error: " + error);
		return null;
	}
}

/* *****************************
 * Check for existing email
 * ***************************** */
async function checkExistingEmail(account_email) {
	try {
		const sql = "SELECT * FROM account WHERE account_email = $1";
		const data = await pool.query(sql, [account_email]);
		return data.rowCount > 0;
	} catch (error) {
		console.error("checkExistingEmail error: " + error);
		return null;
	}
}

/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail(account_email) {
	try {
		const result = await pool.query(
			"SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1",
			[account_email]
		);
		return result.rows[0];
	} catch (error) {
		console.error("getAccountByEmail error: " + error);
		return null;
	}
}

module.exports = {registerAccount, checkExistingEmail, getAccountByEmail};
