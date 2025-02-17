import path from 'path';
import { writeFile } from '../fileUtils.js';

export function generate(basePath, options) {
    const ext = options.useTypeScript ? '.ts' : '.js';
    const srcPath = path.resolve(basePath, 'src');

    const importConfig = `import { config } from './config/config${options.useTypeScript ? '' : '.js'}';`;
    const importDB = options.useMongoDB ? `import './config/db${options.useTypeScript ? '' : '.js'}';` : '';

    const serverContent = `
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.text('¡Bienvenido a Hono!'));

export default app;
    `.trim();

    const indexContent = options.useTypeScript
        ? `import { serve } from '@hono/node-server';\nimport app from './app.js';\n${importConfig}\n${importDB}\nserve(app).addListener('listening', () => {
    console.log(\`🚀 Servidor Hono corriendo en http://localhost:\${config.port}\`);
})`
        : `import { serve } from '@hono/node-server';\nimport app from './app.js';\n${importConfig}\n${importDB}\nserve(app);`;

    writeFile(path.resolve(srcPath, `app${ext}`), serverContent);
    writeFile(path.resolve(srcPath, `index${ext}`), indexContent);
}
