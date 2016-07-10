'use strict';

var path = require('path');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var rewire = require('rewire');

var expect = chai.expect;

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('task:webpack', function() {
	var mockApi;
	var mockWebpack;
	var task;
	before(function() {
		mockApi = createMockApi();
		mockWebpack = createMockWebpack();
		task = rewire('../../lib/tasks/webpack');
		task.__set__('webpack', mockWebpack);
	});

	afterEach(function() {
		mockWebpack.reset();
		mockApi.utils.log.info.reset();
		mockApi.utils.log.error.reset();
	});

	function createMockApi() {
		return {
			errors: {
				TaskError: createCustomError('TaskError')
			},
			utils: {
				log: {
					info: sinon.spy(),
					error: sinon.spy()
				}
			}
		};

		function createCustomError(type) {
			function CustomError(message) {
				this.message = message;
			}

			CustomError.prototype = Object.create(Error.prototype);
			CustomError.prototype.name = type;

			return CustomError;
		}
	}

	function createMockWebpack() {
		var mockWebpack = sinon.spy(function(config) {
			var mockCompile = createMockCompile(config);
			var instance = {
				run: sinon.spy(mockCompile),
				watch: sinon.spy(function(watchOptions, callback) {
					return mockCompile(function() {
						callback();
					});
				})
			};
			mockWebpack.instance = instance;
			mockWebpack.instance.error = null;
			mockWebpack.instance.stats = null;
			return instance;
		});

		mockWebpack.instance = null;

		var reset = mockWebpack.reset;
		mockWebpack.reset = function() {
			reset.call(mockWebpack);
			mockWebpack.instance = null;
		};

		return mockWebpack;



		function createMockCompile(config) {
			return function(callback) {
				var instance = this;
				var hasError = (config.entry === './error.js');
				var hasCompileError = (config.entry === './compile-error.js');
				if (hasError) {
					var error = new Error('Webpack error');
					instance.error = error;
					instance.stats = null;
					callback(error);
				} else if (hasCompileError) {
					var errorStats = {
						hasErrors: function() {
							return true;
						},
						toString: function() {
							return 'compile failed';
						}
					};
					instance.error = null;
					instance.stats = errorStats;
					callback(null, errorStats);
				} else {
					var successStats = {
						hasErrors: function() {
							return false;
						},
						toString: function() {
							return 'compile succeeded';
						}
					};
					instance.error = null;
					instance.stats = successStats;
					callback(null, successStats);
				}
			}
		}
	}

	it('should have a description', function() {
		expect(task.description).to.be.a('string');
	});

	it('should specify default configuration', function() {
		expect(task.defaults).to.eql({
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
		});
	});

	it('should compile source files using webpack API', function(done) {
		task.call(mockApi, {
			entry: 'index.js',
			output: {
				filename: 'main.js',
				path: './dist'
			}
		}, function(error, stats) {
			expect(error).not.to.exist;
			expect(stats).to.exist;
			expect(mockWebpack).to.have.been.calledOnce;
			expect(mockWebpack).to.have.been.calledWith({
				entry: 'index.js',
				output: {
					filename: 'main.js',
					path: './dist'
				}
			});
			expect(mockWebpack.instance.run).to.have.been.calledOnce;
			expect(mockWebpack.instance.watch).not.to.have.been.called;
			done();
		});
	});

	it('should merge external config files', function(done) {
		task.call(mockApi, {
			entry: 'index.js',
			output: {
				filename: 'main.js',
				path: './dist'
			},
			config: path.resolve(__dirname, '../fixtures/webpack.config.js')
		}, function(error, stats) {
			expect(error).not.to.exist;
			expect(stats).to.exist;
			expect(mockWebpack).to.have.been.calledOnce;
			expect(mockWebpack).to.have.been.calledWith({
				entry: 'index.js',
				output: {
					filename: 'main.js',
					path: './dist'
				},
				custom: true
			});
			done();
		});
	});

	it('should allow relative path to config file', function(done) {
		var configPath = path.resolve(__dirname, '../fixtures/webpack.config.js');
		var relativeConfigPath = './' + path.relative(process.cwd(), configPath);
		task.call(mockApi, {
			entry: 'index.js',
			output: {
				filename: 'main.js',
				path: './dist'
			},
			config: relativeConfigPath
		}, function(error, stats) {
			expect(error).not.to.exist;
			expect(stats).to.exist;
			expect(mockWebpack).to.have.been.calledOnce;
			expect(mockWebpack).to.have.been.calledWith({
				entry: 'index.js',
				output: {
					filename: 'main.js',
					path: './dist'
				},
				custom: true
			});
			done();
		});
	});
});
