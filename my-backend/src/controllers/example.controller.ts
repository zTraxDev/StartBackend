import { Request, Response } from 'express';

export const exampleController = (_req: Request, res: Response) => {
    res.send('¡Hola desde el controlador de ejemplo!');
};