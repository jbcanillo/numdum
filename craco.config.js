const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env }) => {
      if (env === 'production') {
        // Find existing TerserPlugin to preserve JS minification
        const TerserPlugin = webpackConfig.optimization.minimizer.find(
          (plugin) => plugin.constructor.name === 'TerserPlugin'
        );

        // Clear minimizer array
        webpackConfig.optimization.minimizer = [];

        // Re-add TerserPlugin if found, with its original options
        if (TerserPlugin) {
          webpackConfig.optimization.minimizer.push(TerserPlugin);
        }

        // Add CssMinimizerPlugin with calc disabled
        webpackConfig.optimization.minimizer.push(
          new CssMinimizerPlugin({
            parallel: true,
            minimizerOptions: {
              preset: ['default', { calc: false }],
            },
          })
        );
      }

      return webpackConfig;
    },
  },
};
