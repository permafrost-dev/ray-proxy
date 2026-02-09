import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.{test,spec}.{ts,js}'],
        exclude: ['node_modules', 'dist'],
        coverage: {
            provider: 'v8',
            reporter: ['html', 'text'],
            include: ['src/**/*.{ts,js}'],
            exclude: ['node_modules', 'vendor', 'dist', 'tests'],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@tests': path.resolve(__dirname, './tests'),
        },
    },
});
