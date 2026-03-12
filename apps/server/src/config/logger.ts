class Logger {
	error(...data: unknown[]) {
		this.log("error", ...data);
	}

	info(...data: unknown[]) {
		this.log("info", ...data);
	}

	log(...params: ["error" | "info" | "warn", ...unknown[]] | unknown[]) {
		const timestamp = new Date().toISOString();

		if (
			params.length > 1 &&
			["error", "info", "warn"].includes(params[0] as string)
		) {
			if (params[0] === "info") {
				console.info(`${timestamp} [INFO]`, ...params.slice(1));
				return;
			}

			if (params[0] === "warn") {
				console.warn(`${timestamp} [WARN]`, ...params.slice(1));
				return;
			}

			if (params[0] === "error") {
				console.error(`${timestamp} [ERROR]`, ...params.slice(1));
				return;
			}
		}

		console.log(`${timestamp} [LOG]`, ...params);
	}

	warn(...data: unknown[]) {
		this.log("warn", ...data);
	}
}

const logger = new Logger();

export default logger;
