const path = require('path');

module.exports = {
    css: {
        loaderOptions: {
            sass: {
                prependData: `@import "@/utils/variables.scss";`
            }
        }
    },
    devServer: {
        host: '0.0.0.0',
        port: 2929, // CHANGE YOUR PORT HERE!
        https: true,
        hotOnly: false,
    },
    publicPath: process.env.NODE_ENV === 'production'
        ? '/demo-widget-order-3rd/'
        // ? '/widget-order-3rd-v2/'
        : '/'
}



