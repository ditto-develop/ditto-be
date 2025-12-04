const { camelCaseToPascalCase, camelCaseToScreamingSnakeCase, camelCaseToKebabCase } = require('./util');

module.exports = function getDtoFileContent(moduleName) {
  const moduleNameKebab = camelCaseToKebabCase(moduleName);
  const entityName = `${camelCaseToPascalCase(moduleName)}`;
  const interfaceName = `I${camelCaseToPascalCase(moduleName)}Repository`;
  const repositoryTokenName = `${camelCaseToScreamingSnakeCase(moduleName)}_REPOSITORY_TOKEN`;

  return `
  import { ${entityName} } from '@module/${moduleNameKebab}/domain/entities/${moduleNameKebab}.entity';

  export interface ${interfaceName} {}

  export const ${repositoryTokenName} = Symbol('${interfaceName}');
  `;
};
