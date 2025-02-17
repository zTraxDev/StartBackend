import express from 'express';
import { config } from './config/config';


const app = express();
const PORT = config.port || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
    res.send('¡Hola desde Express!');
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor Express en http://localhost:${PORT}`);
});