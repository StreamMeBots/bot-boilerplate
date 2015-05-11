module.exports = {
	protocol: process.env.BOT_PROTOCOL || 'https://',
	restProtocol: process.env.BOT_REST_PROTOCOL || 'https://',
	host: process.env.BOT_HOST || 'www.stream.me',
	port: process.env.BOT_PORT || 2020,
	logLevel: process.env.BOT_LOG_LEVEL || 'info',
	pemFile: process.env.BOT_PEM_FILE || null
};
