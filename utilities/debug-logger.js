const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "..", "debug.log");

fs.writeFileSync(
	logFile,
	`=== Debug Log Started at ${new Date().toISOString()} ===\n\n`
);

/**
 * Log debug information to a file
 * @param {string} source - Source of the log (controller, model, etc.)
 * @param {string} message - Log message
 * @param {object} data - Optional data to log
 */
function log(source, message, data = null) {
	const timestamp = new Date().toISOString();
	let logMessage = `[${timestamp}] [${source}] ${message}\n`;

	if (data) {
		// Handle Error objects specially
		if (data instanceof Error) {
			logMessage += `Error: ${data.message}\n`;
			logMessage += `Stack: ${data.stack}\n`;
		} else {
			try {
				logMessage += `Data: ${JSON.stringify(data, null, 2)}\n`;
			} catch (e) {
				logMessage += `Data: [Cannot stringify data: ${e.message}]\n`;
				logMessage += `Data (toString): ${data.toString()}\n`;
			}
		}
	}

	logMessage += "\n---\n";

	// Append to log file
	fs.appendFileSync(logFile, logMessage);

	// Also log to console in development
	if (process.env.NODE_ENV === "development") {
		console.log(`DEBUG: ${source} - ${message}`);
	}
}

module.exports = {log};
