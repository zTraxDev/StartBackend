import { writeFile } from "../../fileUtils.js";
import path from 'path';

export function generateHonoMvcFiles(srcPath, ext, options) {
    const controllerContent = `
export const exampleController = (c) => {
    return c.json({ message: '¡Hola desde el controlador de ejemplo!' });
};
    `.trim();
    writeFile(path.resolve(srcPath, 'controllers', `example.controller${ext}`), controllerContent);

    const routeContent = `
import { Hono } from 'hono';
import { exampleController } from '../controllers/example.controller${ext.slice(0, -3)}';

const exampleRouter = new Hono();

exampleRouter.get('/example', exampleController);

export default exampleRouter;
    `.trim();
    writeFile(path.resolve(srcPath, 'routes', `example.routes${ext}`), routeContent);

    const appContent = `
import { Hono } from 'hono';
import exampleRouter from './routes/example.routes${ext.slice(0, -3)}';

const app = new Hono();

app.route('/', exampleRouter);

export default app;
    `.trim();
    writeFile(path.resolve(srcPath, `app${ext}`), appContent);

    const indexContent = `
import { serve } from '@hono/node-server';
import app from './app${ext.slice(0, -3)}';

serve(app);
    `.trim();
    writeFile(path.resolve(srcPath, `index${ext}`), indexContent);

    // 🔥 Agregamos la generación del modelo
    if (options.database === 'MongoDB' || (options.database !== 'MongoDB' && options.orm !== 'Ninguno')) {
        let modelContent = '';

        if (options.database === 'MongoDB') {
            modelContent = `
import mongoose from 'mongoose';
const exampleSchema = new mongoose.Schema({
    name: String,
    age: Number,
});
export const Example = mongoose.model('Example', exampleSchema);
            `.trim();
        } else if (options.orm === 'Sequelize') {
            modelContent = `
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db${ext}';

class Example extends Model {}

Example.init({
    name: DataTypes.STRING,
    age: DataTypes.INTEGER,
}, {
    sequelize,
    modelName: 'Example',
});

export default Example;
            `.trim();
        } else if (options.orm === 'TypeORM') {
            modelContent = `
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Example {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    age: number;
}
            `.trim();
        }

        writeFile(path.resolve(srcPath, 'models', `example.model${ext}`), modelContent);
    }
}
