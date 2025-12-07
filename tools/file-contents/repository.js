const { camelCaseToPascalCase, camelCaseToKebabCase } = require('./util');

module.exports = function getDtoFileContent(moduleName) {
  const moduleNameKebab = camelCaseToKebabCase(moduleName);
  const repositoryName = `${camelCaseToPascalCase(moduleName)}Repository`;
  const entityName = `${camelCaseToPascalCase(moduleName)}`;
  const interfaceName = `I${camelCaseToPascalCase(moduleName)}Repository`;

  return `
  import { Injectable } from '@nestjs/common';
  import { PrismaService } from '@module/common/prisma/prisma.service';
  import { ${entityName} } from '@module/${moduleNameKebab}/domain/entities/${moduleNameKebab}.entity';
  import { ${interfaceName} } from '@module/${moduleNameKebab}/infrastructure/repository/${moduleNameKebab}.repository.interface';


  @Injectable()
  export class ${repositoryName} implements ${interfaceName} {
    constructor(private readonly prisma: PrismaService) {
      console.log('[${repositoryName}] ${repositoryName} 초기화');
    }

    private toDomain(${moduleName}: {}): ${entityName} {
      return new ${entityName}();
    }
  }
  `;
};
