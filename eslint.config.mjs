import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import { defineConfig } from 'eslint/config'
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'
import eslintPluginAstro from 'eslint-plugin-astro'

export default defineConfig([
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/.astro/**',
            'commitlint.config.js',
        ],
    },
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        plugins: { js },
        extends: ['js/recommended'],
    },
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        languageOptions: { globals: globals.browser },
    },
    tseslint.configs.recommended,
    { ...pluginReact.configs.flat.recommended, ignores: ['**/*.astro'] },
    eslintPluginAstro.configs.recommended,
    { ...eslintPluginPrettier, ignores: ['**/*.astro'] },
    {
        rules: {
            'react/react-in-jsx-scope': 'off',
        },
    },
])
