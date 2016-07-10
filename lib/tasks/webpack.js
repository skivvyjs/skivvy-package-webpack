'use strict';

var path = require('path');
var webpack = require('webpack');
var merge = require('lodash.merge');

module.exports = function(config, callback) {
	var api = this;
	var configPath = config.config;
	if (configPath) {
		var configFile = require(path.resolve(process.cwd(), configPath));
		var configProperties = Object.keys(config)
			.filter(function(key) { return key !== 'config'; })
			.reduce(function(props, key) {
				props[key] = config[key];
				return props;
			}, {});
		config = merge({}, configFile, configProperties);
		delete config.config;
	}
	var compiler = webpack(config);
	if (config.watch) {
		var watchOptions = null;
		compiler.watch(watchOptions, onCompileCompleted);
	} else {
		compiler.run(function(error, stats) {
			onCompileCompleted(error, stats);
			var hasCompileErrors = stats && stats.hasErrors();
			if (!error && hasCompileErrors) {
				error = new Error('Webpack compilation failed');
			}
			callback(error, stats);
		});
	}


	function onCompileCompleted(error, stats) {
		if (stats) {
			api.utils.log.info('Webpack compilation results:' + '\n\n' + stats.toString({ colors: true }) + '\n');
		}
	}
};

module.exports.defaults = {
	watch: false,
	config: null,
	context: undefined,
	entry: undefined,
	output: {
		filename: undefined,
		path: undefined,
		publicPath: undefined,
		chunkFilename: undefined,
		sourceMapFilename: undefined,
		devtoolModuleFilenameTemplate: undefined,
		devtoolFallbackModuleFilenameTemplate: undefined,
		devtoolLineToLine: undefined,
		hotUpdateChunkFilename: undefined,
		hotUpdateMainFilename: undefined,
		jsonpFunction: undefined,
		hotUpdateFunction: undefined,
		pathinfo: undefined,
		library: undefined,
		libraryTarget: undefined,
		umdNamedDefine: undefined,
		sourcePrefix: undefined,
		crossOriginLoading: undefined
	},
	module: {
		loaders: undefined,
		preLoaders: undefined,
		postLoaders: undefined,
		noParse: undefined
	},
	resolve: {
		alias: undefined,
		root: undefined,
		modulesDirectories: undefined,
		fallback: undefined,
		extensions: undefined,
		packageMains: undefined,
		packageAlias: undefined,
		unsafeCache: undefined
	},
	resolveLoader: {
		alias: undefined,
		root: undefined,
		modulesDirectories: undefined,
		fallback: undefined,
		extensions: undefined,
		packageMains: undefined,
		packageAlias: undefined,
		unsafeCache: undefined,
		moduleTemplates: undefined
	},
	externals: undefined,
	target: undefined,
	bail: undefined,
	profile: undefined,
	cache: undefined,
	debug: undefined,
	devtool: undefined,
	devServer: undefined,
	node: undefined,
	amd: undefined,
	loader: undefined,
	recordsPath: undefined,
	recordsInputPath: undefined,
	recordsOutputPath: undefined,
	plugins: undefined
};

module.exports.description = 'Compile Javascript using webpack';
