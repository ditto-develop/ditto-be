const { camelCaseToPascalCase } = require('./util');

module.exports = function getEntityFileContent(moduleName) {
  const entityName = `${camelCaseToPascalCase(moduleName)}`;

  return `
  export class ${entityName} {
    constructor() {}

    static create(): ${entityName} {
      return new ${entityName}();
    }
  }
  `;
};
