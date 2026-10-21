import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
// https://vite.dev/config/
// Where the API lives. Outside Docker: localhost. Inside docker-compose: the "backend" service.
const API_TARGET = process.env.VITE_PROXY_TARGET || 'http://localhost:4000'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // listen on all network interfaces (needed for phone/ngrok access)
    allowedHosts: [
      'unlineal-interpervasively-jestine.ngrok-free.dev', // current ngrok tunnel
      '.ngrok-free.dev', // allow any future ngrok-free.dev tunnel too
      '.ngrok-free.app',
    ],
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
      '/uploads': {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
  },
})