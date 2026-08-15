import { globalIgnores } from "eslint/config";
import rootConfig from "../../eslint.config.mjs";

const eslintConfig = [
  ...rootConfig,
  // Root ignores are relative to the root config; the admin app needs its
  // own build-output ignores relative to this directory.
  globalIgnores([".next/**", "out/**", "next-env.d.ts"]),
];

export default eslintConfig;
