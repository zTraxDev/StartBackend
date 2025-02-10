import { Hono } from 'hono';
import exampleRouter from './routes/example.routes.js';

const app = new Hono();

app.route('/', exampleRouter);

export default app;