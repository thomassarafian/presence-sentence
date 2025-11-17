export default [
    {
      ignores: ["node_modules"],
    },
    {
      files: ["**/*.js"],
      languageOptions: {
        ecmaVersion: 2023,
        sourceType: "module",
      },
      rules: {
        "prettier/prettier": "error"
      },
      plugins: {
        prettier: require("eslint-plugin-prettier")
      }
    }
  ];
  