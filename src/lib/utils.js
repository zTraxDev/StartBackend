export const GREEN = "\x1b[32m";
export const NC = "\x1b[0m"; // No Color

export function validateProjectName(projectName) {
    const invalidChars = /[\\/:*?"<>|]/;
    return projectName && !invalidChars.test(projectName);
  }
  