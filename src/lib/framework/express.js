import path from "path";
import { writeFile } from "../fileUtils.js";

export function generate(basePath, options) {
    const ext = options.useTypeScript ? ".ts" : ".js";
    const indexPath = path.resolve(basePath, "src", `index${ext}`);

    // Ajuste para los imports de config y db según el entorno
    const importConfig = `import { config } from './config/config${options.useTypeScript ? "" : ".js"}';`;

    const importDB = options.useMongoDB ? `import './config/db${options.useTypeScript ? "" : ".js"}';` : '';

    const indexContent = `
import express from 'express';
${importConfig}
${importDB}

const app = express();
const PORT = config.port || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
    res.send('¡Hola desde Express!');
});

app.listen(PORT, () => {
    console.log(\`🚀 Servidor Express en http://localhost:\${PORT}\`);
});
    `.trim();

    writeFile(indexPath, indexContent);
}
