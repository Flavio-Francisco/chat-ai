import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
 {
rules: {
      "@typescript-eslint/no-explicit-any": "off",      // Desativa o erro do 'any'
      "@typescript-eslint/no-unused-vars": "off",      // Opcional: desativa erro de variáveis não usadas
      "react-hooks/exhaustive-deps": "off"             // Opcional: silencia avisos de dependências do useEffect
    }
 },
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
