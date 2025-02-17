import { createFolder, writeFile } from './fileUtils.js';
import { writeDbFile} from './configUtil.js';
import { writeConfigFile } from './project-setup.js';
import { writeEnvFile } from './project-setup.js';
import { writePackageJson } from './packageUtils.js';
import { installDependencies } from './dependencyUtils.js';
import { generate as generateExpress } from './framework/express.js';
import { generate as generateFastify } from './framework/fastify.js';
import { generate as generateHono } from './framework/Hono.js';
import { setupDatabase } from './project-setup.js';
import path from 'path'; 

export function generateFiles(projectDir, options = { 
    useTypeScript: false, 
    useMVC: false, 
    database: 'MongoDB', 
    framework: 'Express', 
    installEcosystem: false,
    orm: 'Ninguno',
}) {
    createFolder(projectDir);
    process.chdir(projectDir);
    createFolderStructure('.', options);
    
    writeEnvFile(options.database, options.orm);
    setupDatabase(options.database, options.useTypeScript, options.orm);
    writeConfigFile(options.useTypeScript, options.database, options.orm);
    writePackageJson(path.basename(projectDir), options.useTypeScript);
    
    if (options.framework === 'Express') {
        generateExpress('.', options);
    } else if (options.framework === 'Fastify') {
        generateFastify('.', options);
    } else if (options.framework === 'Hono') {
        generateHono('.', options); // 🔥 Aseguramos que `options` se pase correctamente
    }
    
    if (options.useMVC) {
        generateMvcFiles('.', options);
    }
    
    installDependencies(options.useTypeScript, options.database, options.framework, options.installEcosystem, options.orm);
}


function createFolderStructure(basePath, options) {
    const srcPath = path.resolve(basePath, 'src');
    createFolder(srcPath);
    
    createFolder(path.resolve(srcPath, 'config'));
    
    if (options.useTypeScript) {
        createFolder(path.resolve(basePath, 'dist'));
    }

    if (options.useMVC) {
        const mvcFolders = ['controllers', 'routes'];
        
        if (options.database === 'MongoDB' || (options.database !== 'MongoDB' && options.orm !== 'Ninguno')) {
            mvcFolders.push('models');
        }
        
        mvcFolders.forEach(folder => createFolder(path.resolve(srcPath, folder)));
    }
}

function generateMvcFiles(basePath, options) {
    const ext = options.useTypeScript ? '.ts' : '.js';
    const srcPath = path.resolve(basePath, 'src');

    if (options.framework === 'Hono') {
        generateHonoMvcFiles(srcPath, ext, options);
    } else {
        generateExpressFastifyMvcFiles(srcPath, ext, options);
    }
}

function generateExpressFastifyMvcFiles(srcPath, ext, options) {
    // Generar Controlador
    const controllerContent = options.useTypeScript ? `
import { Request, Response } from 'express';

export const exampleController = (_req: Request, res: Response) => {
    res.send('¡Hola desde el controlador de ejemplo!');
};
    `.trim() : `
export const exampleController = (req, res) => {
    res.send('¡Hola desde el controlador de ejemplo!');
};
    `.trim();

    writeFile(path.resolve(srcPath, 'controllers', `example.controller${ext}`), controllerContent);

    // Generar Modelo (si aplica)
    if (options.database === 'MongoDB' || (options.database !== 'MongoDB' && options.orm !== 'Ninguno')) {
        let modelContent = '';
        
        if (options.database === 'MongoDB') {
            modelContent = options.useTypeScript ? `
import { Schema, model } from 'mongoose';

interface IExample {
    name: string;
    age: number;
}

const exampleSchema = new Schema<IExample>({
    name: { type: String, required: true },
    age: { type: Number, required: true }
});

export const Example = model<IExample>('Example', exampleSchema);
            `.trim() : `
import mongoose from 'mongoose';
const exampleSchema = new mongoose.Schema({
    name: String,
    age: Number,
});
export const Example = mongoose.model('Example', exampleSchema);
            `.trim();
            
        } else if (options.orm === 'Sequelize') {
            modelContent = options.useTypeScript ? `
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface ExampleAttributes {
    id: number;
    name: string;
    age: number;
}

interface ExampleCreationAttributes extends Optional<ExampleAttributes, 'id'> {}

class Example extends Model<ExampleAttributes, ExampleCreationAttributes> 
    implements ExampleAttributes {
    public id!: number;
    public name!: string;
    public age!: number;
}

Example.init({
    name: DataTypes.STRING,
    age: DataTypes.INTEGER,
}, {
    sequelize,
    modelName: 'Example'
});

export default Example;
            `.trim() : `
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

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
            modelContent = options.useTypeScript ? `
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
            `.trim() : `
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

        console.log(`Generando modelo en: ${path.resolve(srcPath, 'models', `example.model${ext}`)}`)
        writeFile(path.resolve(srcPath, 'models', `example.model${ext}`), modelContent);
    }

    // Generar Ruta
    const routeContent = options.useTypeScript ? `
import { Router } from 'express';
import { exampleController } from '../controllers/example.controller${ext.slice(0, -3)}';

const router = Router();
router.get('/example', exampleController);

export default router;
    `.trim() : `
import { Router } from 'express';
import { exampleController } from '../controllers/example.controller${ext.slice(0, -3)}';

const router = Router();
router.get('/example', exampleController);

export default router;
    `.trim();

    writeFile(path.resolve(srcPath, 'routes', `example.routes${ext}`), routeContent);
}

function generateHonoMvcFiles(srcPath, ext, options = {}) {
    options.database = options.database || 'MongoDB';
    options.orm = options.orm || 'Ninguno';

    // Controlador
    const controllerContent = options.useTypeScript ? `
import { Context } from 'hono';

export const exampleController = (c: Context) => {
    return c.json({ message: '¡Hola desde el controlador de ejemplo!' });
};
    `.trim() : `
export const exampleController = (c) => {
    return c.json({ message: '¡Hola desde el controlador de ejemplo!' });
};
    `.trim();

    writeFile(path.resolve(srcPath, 'controllers', `example.controller${ext}`), controllerContent);

    // **Archivo de rutas**
    const routesContent = options.useTypeScript ? `
import { Hono } from 'hono';
import { exampleController } from '../controllers/example.controller${ext.slice(0, -3)}';

const exampleRouter = new Hono();

exampleRouter.get('/example', exampleController);

export default exampleRouter;
    `.trim() : `
import { Hono } from 'hono';
import { exampleController } from '../controllers/example.controller.js';

const exampleRouter = new Hono();

exampleRouter.get('/example', exampleController);

export default exampleRouter;
    `.trim();

    writeFile(path.resolve(srcPath, 'routes', `example.routes${ext}`), routesContent);

    // App principal
    const appContent = options.useTypeScript ? `
import { Hono } from 'hono';
import exampleRouter from './routes/example.routes${ext.slice(0, -3)}';

const app = new Hono();

app.route('/', exampleRouter);

export default app;
    `.trim() : `
import { Hono } from 'hono';
import exampleRouter from './routes/example.routes.js';

const app = new Hono();

app.route('/', exampleRouter);

export default app;
    `.trim();

    writeFile(path.resolve(srcPath, `app${ext}`), appContent);

    // Index (Entry point)
    const indexContent = options.useTypeScript ? `
import { serve } from '@hono/node-server';
import { config } from './config/config${ext.slice(0, -3)}';
import app from './app${ext.slice(0, -3)}';

serve({
    fetch: app.fetch,
    port: config.port as number
}, () => {
    console.log(\`🚀 Servidor Hono corriendo en http://localhost:\${config.port}\`);
});
    `.trim() : `
import { serve } from '@hono/node-server';
import { config } from './config/config.js';
import app from './app.js';

serve(app).addListener('listening', () => {
    console.log(\`🚀 Servidor Hono corriendo en http://localhost:\${config.port}\`);
});
    `.trim();

    writeFile(path.resolve(srcPath, `index${ext}`), indexContent);

    // Modelos si hay base de datos
    if (options.database === 'MongoDB' || options.orm !== 'Ninguno') {
        let modelContent = '';

        if (options.database === 'MongoDB') {
            modelContent = options.useTypeScript ? `
import { Schema, model } from 'mongoose';

interface IExample {
    name: string;
    age: number;
}

const exampleSchema = new Schema<IExample>({
    name: { type: String, required: true },
    age: { type: Number, required: true }
});

export const Example = model<IExample>('Example', exampleSchema);
            `.trim() : `
import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
    name: String,
    age: Number,
});

export const Example = mongoose.model('Example', exampleSchema);
            `.trim();
        } else if (options.orm === 'Sequelize') {
            modelContent = options.useTypeScript ? `
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface ExampleAttributes {
    id: number;
    name: string;
    age: number;
}

interface ExampleCreationAttributes extends Optional<ExampleAttributes, 'id'> {}

class Example extends Model<ExampleAttributes, ExampleCreationAttributes> implements ExampleAttributes {
    public id!: number;
    public name!: string;
    public age!: number;
}

Example.init({
    name: DataTypes.STRING,
    age: DataTypes.INTEGER,
}, {
    sequelize,
    modelName: 'Example'
});

export default Example;
            `.trim() : `
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

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
            modelContent = options.useTypeScript ? `
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
            `.trim() : `
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