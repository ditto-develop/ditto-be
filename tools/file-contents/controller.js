const { camelCaseToPascalCase } = require('./util');

module.exports = function getControllerFileContent(moduleName) {
  const controllerName = `${camelCaseToPascalCase(moduleName)}Controller`;
  const apiTagsName = `${camelCaseToPascalCase(moduleName)}`;
  const controllerPathName = `${moduleName}s`;

  return `
  import { Controller } from '@nestjs/common';
  import { ApiTags } from '@nestjs/swagger';
  import { CommandBus } from '@common/command/command-bus';

  @ApiTags('${apiTagsName}')
  @Controller('${controllerPathName}')
  export class ${controllerName} {
    constructor(private readonly commandBus: CommandBus) {
      console.log('[${controllerName}] ${controllerName} 초기화');
    }
  }
  `;
};
