import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    
    
    mysql: {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    },
    
    

    // ORM Configurations
    
    sequelize: {
        databaseUrl: process.env.SEQUELIZE_DATABASE_URL as string,
        logging: process.env.SEQUELIZE_LOGGING === 'true' // Asegúrate de que esté 'true' o 'false' en el .env
    },
    
};