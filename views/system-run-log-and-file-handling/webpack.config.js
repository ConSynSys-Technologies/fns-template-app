const path = require('path')

console.info('Webpack connected!')

module.exports = {
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: 'raw-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                    'css-loader',
                ],
            },
            {
                test: /\.tsx?$/,
                use: { loader: 'ts-loader', options: { transpileOnly: true } },
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
};
