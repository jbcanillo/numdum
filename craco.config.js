const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Find the CssMinimizerPlugin and modify its options to disable postcss-calc
      if (env === 'production') {
        const CssMinimizerPlugin = webpackConfig.optimization.minimizer.find(
          (plugin) => plugin.constructor.name === 'CssMinimizerPlugin'
        );

        if (CssMinimizerPlugin) {
          // Update plugin options to set calc: false for postcss
          CssMinimizerPlugin.options = {
            ...CssMinimizerPlugin.options,
            postcss: {
              ...CssMinimizerPlugin.options.postcss,
              plugins: [
                ...(CssMinimizerPlugin.options.postcss?.plugins || []),
                require('cssnano')({
                  preset: ['default', { calc: false }],
                }),
              ],
            },
          };
        }
      }

      return webpackConfig;
    },
  },
};
