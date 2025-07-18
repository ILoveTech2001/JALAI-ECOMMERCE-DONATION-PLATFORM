export const plugins = {
  '@tailwindcss/postcss': {}, // ✅ updated
  autoprefixer: {},
};
// This PostCSS configuration uses the Tailwind CSS plugin and Autoprefixer.
// The Tailwind CSS plugin is configured to process the styles, while Autoprefixer ensures
// that the CSS is compatible with different browsers by adding necessary vendor prefixes.
// Make sure to install the required packages:
// npm install tailwindcss autoprefixer postcss --save-dev
// You can customize the Tailwind CSS configuration further by creating a `tailwind.config.js` file
// in your project root, where you can define themes, colors, and other design tokens.
// This setup is essential for building modern, responsive web applications with Tailwind CSS and PostCSS
// in a React environment. It allows you to write utility-first CSS styles that are processed at build time,
// ensuring optimal performance and maintainability of your styles.
// The `postcss.config.mjs` file is used to configure PostCSS in a modular way, allowing you to use ES module syntax.
// This is particularly useful in modern JavaScript projects where build tools and module bundlers are commonly used.