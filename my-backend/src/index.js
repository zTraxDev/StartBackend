import { serve } from '@hono/node-server';
import { config } from './config/config.js'
import app from './app.js';

serve(app).addListener('listening', () => {
    console.log(`🚀 Servidor Hono corriendo en http://localhost:${config.port}`);
})