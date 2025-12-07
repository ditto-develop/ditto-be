const { camelCaseToPascalCase } = require('./util');

module.exports = function getDtoFileContent(moduleName) {
  const dtoName = `${camelCaseToPascalCase(moduleName)}Dto`;

  return `
  export class ${dtoName} {
    constructor() {}

    static fromDomain(${moduleName}: {}): ${dtoName} {
      return new ${dtoName}();
    }
  }
  `;
};
