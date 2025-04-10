const pool = require("../db/pool");
const debugLogger = require("../utilities/debug-logger");

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
		debugLogger.log(
			"accountModel",
			`Registering new account for: ${account_email}`
		);
		debugLogger.log(
			"accountModel",
			`Password hash length: ${account_password.length}`
		);

		const sql =
			"INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";

		const data = await pool.query(sql, [
			account_firstname,
			account_lastname,
			account_email,
			account_password,
		]);

		if (data.rows[0]) {
			debugLogger.log("accountModel", `Account registered successfully`, {
				account_id: data.rows[0].account_id,
				email: data.rows[0].account_email,
				// Check if the password was stored correctly by checking its length
				password_stored_length: data.rows[0].account_password.length,
			});
		} else {
			debugLogger.log(
				"accountModel",
				`No data returned from account registration query`
			);
		}

		return data.rows[0];
	} catch (error) {
		debugLogger.log("accountModel", `Error registering account`, error);
		console.error("registerAccount error:", error);
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
		console.error("checkExistingEmail error:", error);
		return null;
	}
}

/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail(account_email) {
	try {
		debugLogger.log(
			"accountModel",
			`Getting account by email: ${account_email}`
		);

		const result = await pool.query(
			"SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1",
			[account_email]
		);

		if (result.rows[0]) {
			debugLogger.log(
				"accountModel",
				`Found account for email: ${account_email}`,
				{
					account_id: result.rows[0].account_id,
					password_length: result.rows[0].account_password
						? result.rows[0].account_password.length
						: 0,
				}
			);
		} else {
			debugLogger.log(
				"accountModel",
				`No account found for email: ${account_email}`
			);
		}

		return result.rows[0];
	} catch (error) {
		debugLogger.log("accountModel", `Error getting account by email`, error);
		console.error("getAccountByEmail error:", error);
		return null;
	}
}

/* *****************************
 * Return account data using account id
 * ***************************** */
async function getAccountById(account_id) {
	try {
		const result = await pool.query(
			"SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1",
			[account_id]
		);
		return result.rows[0];
	} catch (error) {
		console.error("getAccountById error:", error);
		return null;
	}
}

/* *****************************
 * Update account data
 * ***************************** */
async function updateAccount(
	account_id,
	account_firstname,
	account_lastname,
	account_email
) {
	try {
		const sql =
			"UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *";

		const data = await pool.query(sql, [
			account_firstname,
			account_lastname,
			account_email,
			account_id,
		]);

		return data.rows[0];
	} catch (error) {
		console.error("updateAccount error:", error);
		return null;
	}
}

/* *****************************
 * Update account password
 * ***************************** */
async function updatePassword(account_id, account_password) {
	try {
		debugLogger.log(
			"accountModel",
			`Updating password for account ID: ${account_id}`
		);
		debugLogger.log(
			"accountModel",
			`New password hash length: ${account_password.length}`
		);

		const sql =
			"UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *";

		const data = await pool.query(sql, [account_password, account_id]);

		if (data.rows[0]) {
			debugLogger.log(
				"accountModel",
				`Password updated successfully for account ID: ${account_id}`
			);
		} else {
			debugLogger.log(
				"accountModel",
				`No data returned from password update query`
			);
		}

		return data.rows[0];
	} catch (error) {
		debugLogger.log("accountModel", `Error updating password`, error);
		console.error("updatePassword error:", error);
		return null;
	}
}

module.exports = {
	registerAccount,
	checkExistingEmail,
	getAccountByEmail,
	getAccountById,
	updateAccount,
	updatePassword,
};
