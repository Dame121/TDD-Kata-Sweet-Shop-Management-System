import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    define: {
        'process.env.NODE_ENV': JSON.stringify('development')
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@assets': path.resolve(__dirname, './src/assets'),
            '@components': path.resolve(__dirname, './src/components'),
            '@pages': path.resolve(__dirname, './src/pages'),
            '@auth': path.resolve(__dirname, './src/auth'),
            '@configs': path.resolve(__dirname, './src/configs'),
            '@context': path.resolve(__dirname, './src/context'),
            '@features': path.resolve(__dirname, './src/features'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@lib': path.resolve(__dirname, './src/lib'),
            '@redux': path.resolve(__dirname, './src/redux'),
            '@router': path.resolve(__dirname, './src/router'),
            '@utility': path.resolve(__dirname, './src/utility'),
            '@styles': path.resolve(__dirname, './src/styles'),
        },
    },
    server: {
        port: 3000,
        open: true,
    },
});
