import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "max-len": ["error", { ignoreComments: true, code: 120 }],
      quotes: ["error", "double"],
      semi: ["error", "always"],
      curly: ["error", "multi-line"],
      "nonblock-statement-body-position": ["error", "beside"],
      "react/jsx-tag-spacing": ["error"],
      "import/prefer-default-export": "off",
    },
  },
];

export default eslintConfig;
