import path from "path";
import { writeFile } from "../fileUtils.js";

export function generate(basePath, options) {
    const ext = options.useTypeScript ? ".ts" : ".js";
    const indexPath = path.resolve(basePath, "src", `index${ext}`);

    const indexContent = `
        import Fastify from 'fastify';
        import { config } from './config${ext}';
        ${options.useMongoDB ? `import './db${ext}';` : ''}

        const fastify = Fastify({ logger: true });
        const PORT = config.port;

        fastify.get('/', async (request, reply) => {
            return { message: '¡Hola desde Fastify!' };
        });

        fastify.listen({ port: PORT }, (err) => {
            if (err) {
                fastify.log.error(err);
                process.exit(1);
            }
            console.log(\`Servidor Fastify escuchando en http://localhost:\${PORT}\`);
        });
    `;

    writeFile(indexPath, indexContent);
}