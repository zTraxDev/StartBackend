import inquirer from "inquirer";

export async function askQuestions() {
  const answers = await inquirer.prompt([
      {
          type: 'input',
          name: 'projectName',
          message: '¿Cómo quieres llamar a tu proyecto?',
          default: 'my-backend',
      },
      {
          type: 'list',
          name: 'framework',
          message: '¿Qué framework deseas usar?',
          choices: ['Express', 'Hono'],
      },
      {
          type: 'confirm',
          name: 'useMVC',
          message: '¿Quieres una estructura MVC?',
          default: true,
      },
      {
          type: 'list',
          name: 'database',
          message: '¿Qué base de datos deseas usar?',
          choices: ['MongoDB', 'MySQL', 'PostgreSQL', 'SQLite'],
      },
      // Pregunta condicional para seleccionar el ORM
      {
          type: 'list',
          name: 'orm',
          message: '¿Qué ORM deseas usar?',
          choices: ['Ninguno', 'Sequelize', 'TypeORM'],
          when: (answers) => answers.database !== 'MongoDB',
          default: 'Ninguno',
      },
      {
          type: 'confirm',
          name: 'installEcosystem',
          message: '¿Deseas instalar el ecosistema de Express (rate-limit, session, jwt, zod, express-validator)?',
          default: false,
          when: (answers) => answers.framework === 'Express',
      },
  ]);

  return answers;
}
