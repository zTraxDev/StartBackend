import path from "path";
import { writeFile } from "../fileUtils.js";

export function generate(basePath, options) {
    const ext = options.useTypeScript ? ".ts" : ".js";
    const indexPath = path.resolve(basePath, "src", `index${ext}`);

    const indexContent = `
import express from 'express';
import { config } from './config/config${ext}';
${options.useMongoDB ? `import './db${ext}';` : ''}

const app = express();
const PORT = config.port;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('¡Hola desde Express!');
});

app.listen(PORT, () => {
    console.log(\`Servidor Express escuchando en http://localhost:\${PORT}\`);
});
    `.trim();

    writeFile(indexPath, indexContent);
}