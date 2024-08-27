# turing_hmi_sdk

A toolkit for rapid development of Turing HMI based on React.

## Installation
* Package Installation
    ```bash
    npm i turing_hmi_sdk
    ```
* Environment Setup (Make sure Babel is already installed)
    1. Install packages
        ```bash
        npm i customize-cra --save-dev
        npm i react-app-rewired --save-dev
        ```    
    2. Modify `package.json`
        ```json
        "scripts": {
            "start": "react-app-rewired start",
            "build": "react-app-rewired build",
            ...
        },
        ```
    3. Add a **.babelrc** file in the root directory of your React application:
        ```json
        {
          "presets": ["@babel/preset-env", "@babel/preset-react"],
          "plugins": ["@babel/plugin-transform-runtime"]
        }
        ```
    4. Add a **config-overrides.js** file in the root directory of your React application:
        ```js
        const { override, addBabelPreset, addWebpackModuleRule } = require("customize-cra");

        module.exports = override(
          addBabelPreset("@babel/preset-react"),
          addWebpackModuleRule({
            test: /\.(jsx)$/,
            include: /node_modules/, // Specify the node_modules path that needs to be transpiled
            use: {
              loader: "babel-loader",
              options: {
                presets: ["@babel/preset-env", "@babel/preset-react"],
              },
            },
          })
        );
        ```
