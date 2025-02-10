import { writeFile } from '../fileUtils.js';
import path from 'path';

export function generate(basePath, options) {
    const ext = options.useTypeScript ? '.ts' : '.js';
    const srcPath = path.resolve(basePath, 'src');

    const serverContent = `
import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => c.text('¡Bienvenido a Hono!'));

export default app;
    `.trim();

    const indexContent = options.useTypeScript
        ? `import { serve } from '@hono/node-server';\nimport app from './app.js';\nimport { config } from './config/config.js'\nserve(app).addListener('listening', () => {
    console.log(\`🚀 Servidor Hono corriendo en http://localhost:\${config.port}\`);
})`
        : `import { serve } from '@hono/node-server';\nimport app from './app.js';\nserve(app);`;

    writeFile(path.resolve(srcPath, `app${ext}`), serverContent);
    writeFile(path.resolve(srcPath, `index${ext}`), indexContent);
}
