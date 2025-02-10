import { createFolder, writeFile } from './fileUtils.js';
import { writeEnvFile, writeDbFile, writeConfigFile } from './configUtil.js';
import { writePackageJson } from './packageUtils.js';
import { installDependencies } from './dependencyUtils.js';
import { generate as generateExpress } from './framework/express.js';
import { generate as generateFastify } from './framework/fastify.js';
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
    
    writeEnvFile(options.database);
    setupDatabase(options.database, options.useTypeScript, options.orm);
    writeConfigFile(options.useTypeScript, options.database);
    writePackageJson(path.basename(projectDir), options.useTypeScript);
    
    if (options.framework === 'Express') {
        generateExpress('.', options);
    } else if (options.framework === 'Fastify') {
        generateFastify('.', options);
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
    
    if (options.useLogger) {
        createFolder(path.resolve(srcPath, 'logger'));
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

    const controllerContent = `
export const exampleController = (req, res) => {
    res.send('¡Hola desde el controlador de ejemplo!');
};
    `.trim();
    writeFile(path.resolve(srcPath, 'controllers', `example.controller${ext}`), controllerContent);

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

    const routeContent = `
import { Router } from 'express';
import { exampleController } from '../controllers/example.controller${ext.slice(0, -3)}';

const router = Router();
router.get('/example', exampleController);

export default router;
    `.trim();
    writeFile(path.resolve(srcPath, 'routes', `example.routes${ext}`), routeContent);
}