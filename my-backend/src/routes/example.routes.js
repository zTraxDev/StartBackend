import { Hono } from 'hono';
import { exampleController } from '../controllers/example.controller.js';

const exampleRouter = new Hono();

exampleRouter.get('/example', exampleController);

export default exampleRouter;