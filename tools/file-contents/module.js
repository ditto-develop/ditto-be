const { camelCaseToPascalCase, camelCaseToScreamingSnakeCase, camelCaseToKebabCase } = require('./util');

module.exports = function getModuleFileContent(moduleName) {
  const moduleNameKebab = camelCaseToKebabCase(moduleName);
  const moduleNamePascal = `${camelCaseToPascalCase(moduleName)}Module`;
  const repositoryName = `${camelCaseToPascalCase(moduleName)}Repository`;
  const providerName = `${camelCaseToPascalCase(moduleName)}RepositoryProvider`;
  const repositoryTokenName = `${camelCaseToScreamingSnakeCase(moduleName)}_REPOSITORY_TOKEN`;
  const controllerName = `${camelCaseToPascalCase(moduleName)}Controller`;

  return `
  import { Module, OnModuleInit } from '@nestjs/common';
  import { CommandBus } from '@common/command/command-bus';
  import { CommandBusModule } from '@common/command/command-bus.module';
  import { registerCommandHandlers } from '@common/command/command-handler-registry.util';
  import { ${repositoryName} } from '@module/${moduleNameKebab}/infrastructure/repository/${moduleNameKebab}.repository';
  import { ${repositoryTokenName} } from '@module/${moduleNameKebab}/infrastructure/repository/${moduleNameKebab}.repository.interface';
  import { ${controllerName} } from '@module/${moduleNameKebab}/presentation/controller/${moduleNameKebab}.controller';


  const ${providerName} = {
    provide: ${repositoryTokenName},
    useClass: ${repositoryName},
  };

  @Module({
    imports: [CommandBusModule],
    controllers: [${controllerName}],
    providers: [
      // Repositories
      ${providerName},

      // UseCases

      // Handlers
    ],
    exports: [${repositoryTokenName}],
  })
  export class ${moduleNamePascal} implements OnModuleInit {
    constructor(
      private readonly commandBus: CommandBus,
    ) {
      console.log('[${moduleNamePascal}] ${moduleNamePascal} 초기화');
    }

    onModuleInit(): void {
      registerCommandHandlers(
        this.commandBus,
        [],
        '${moduleNamePascal}',
      );
    }
  }
  `;
};
