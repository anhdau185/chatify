import type { Config } from 'prettier';

const config: Config = {
  trailingComma: 'all',
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  arrowParens: 'avoid',
  plugins: ['prettier-plugin-tailwindcss'], // auto-rearrange class names
};

export default config;
