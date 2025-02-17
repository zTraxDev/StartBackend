import { Sequelize } from 'sequelize';
import { config } from './config';

export const sequelize = new Sequelize(config.sequelize.databaseUrl);

sequelize.authenticate()
    .then(() => console.log('Sequelize conectado'))
    .catch(err => console.error('Error conectando a Sequelize:', err));