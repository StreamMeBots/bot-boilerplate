var NwBuilder = require('node-webkit-builder');
var nw = new NwBuilder({
  version: '0.12.1',
	files: './app/**/**',
	platforms: ['osx32', 'osx64', 'win32', 'win64', 'linux32', 'linux64'],
	appName: 'Bot Bootstrap',
	macIcns: 'icons/mac/logo.icns',
	winIco: 'icons/win/logo.ico'
});

nw.on('log',  console.log);

// Build returns a promise
nw.build().then(function () {
	console.log('build finished.')
}).catch(function (err) {
	console.error(err);
	process.exit(1);
});
