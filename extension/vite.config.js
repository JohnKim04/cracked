import { defineConfig, loadEnv } from 'vite'; // Import loadEnv
import path from 'path';
import fs from 'fs-extra';

const manifestPath = path.resolve(__dirname, 'manifest.json');
const assetsDir = path.resolve(__dirname);
const outDir = path.resolve(__dirname, 'dist');
const srcDir = path.resolve(__dirname, 'src');

// Simple plugin to copy assets and process manifest.json
function processManifestPlugin(mode) { // Pass mode to loadEnv
  // Load env variables based on the current mode (development/production)
  const env = loadEnv(mode, process.cwd(), ''); // Load all env vars without prefix filtering

  return {
    name: 'process-manifest-assets',
    writeBundle() {
      // --- Process manifest.json ---
      try {
        // Read the original manifest content
        let manifestContent = fs.readFileSync(manifestPath, 'utf-8');

        // Replace placeholders with actual environment variable values
        // Make sure VITE_SUPABASE_URL is defined in your .env file
        if (env.VITE_SUPABASE_URL) {
          // Escape dots for regex if needed, or use simple string replace
          // Ensure the placeholder matches exactly what's in your manifest
          manifestContent = manifestContent.replace(
            '"__SUPABASE_URL__/*"', // Match the exact string in host_permissions
            `"${env.VITE_SUPABASE_URL}/*"` // Replace with the env var value
          );
          console.log(`Replaced placeholder with Supabase URL in manifest.json`);
        } else {
          console.warn('VITE_SUPABASE_URL not found in environment variables. Manifest placeholder not replaced.');
        }

        // Write the modified content to the output directory
        fs.writeFileSync(path.resolve(outDir, 'manifest.json'), manifestContent);
        console.log('Processed and copied manifest.json');

      } catch (error) {
        console.error('Error processing manifest.json:', error);
      }

      // --- Copy other assets ---
      // Example: Copying hello_extensions.png
      const iconPath = path.resolve(assetsDir, 'hello_extensions.png');
      if (fs.existsSync(iconPath)) {
        fs.copySync(iconPath, path.resolve(outDir, 'hello_extensions.png'));
        console.log('Copied hello_extensions.png');
      }
      // Add more fs.copySync lines here for other static assets if needed
    }
  }
}


// Use defineConfig with a function to access the mode
export default defineConfig(({ mode }) => {
  return {
    // Define where your source code lives
    // root: srcDir, // If using src directory

    build: {
      // Output directory for the build
      outDir: outDir,
      // Clear the output directory before building
      emptyOutDir: true,

      // Configure Rollup options for more control over the build
      rollupOptions: {
        // Define entry points for your scripts
        input: {
          // Assuming your scripts are in an 'src' directory
          background: path.resolve(srcDir, 'background.js'),
          content: path.resolve(srcDir, 'content.js'),
        },
        output: {
          // Use 'esm' format for Manifest V3 service workers and content scripts
          format: 'esm',
          // Define naming pattern for entry files
          entryFileNames: '[name].js',
          // Define naming pattern for chunks (if any are generated)
          chunkFileNames: 'chunks/[name]-[hash].js',
          // Define naming pattern for assets (like CSS if imported)
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },
    // Add the custom plugin, passing the current mode
    plugins: [processManifestPlugin(mode)],
  }
});
