const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
	mode: "development",
	entry: "./src/index.js",
	resolve: {
		modules: ["node_modules", path.resolve(__dirname, "src/scss")],
		extensions: [".js", ".scss"],
	},
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "akvo-rag.js",
		library: {
			name: "AkvoRAG",
			type: "umd",
		},
		globalObject: "this",
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: "babel-loader", // optional
				exclude: /node_modules/,
			},
			{
				test: /\.s[ac]ss$/i,
				use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./public/index.html",
		}),
		new MiniCssExtractPlugin({
			filename: "akvo-rag.css",
		}),
	],
	devServer: {
		static: {
			directory: path.join(__dirname, "dist"),
		},
		compress: true,
		host: "0.0.0.0",
		port: 8080,
		hot: true,
		allowedHosts: "all",
		watchFiles: {
			paths: ["src/**/*", "public/**/*"],
			options: {
				usePolling: process.env.WATCHPACK_POLLING === "true",
			},
		},
	},
	optimization: {
		minimize: true,
	},
};
