const getControllerFileContent = require('./controller');
const getDtoFileContent = require('./dto');
const getEntityFileContent = require('./entity');
const getModuleFileContent = require('./module');
const getRepositoryInterfaceFileContent = require('./repository-interface');
const getRepositoryFileContent = require('./repository');

const getFileContent = (moduleName) => {
  return {
    controller: getControllerFileContent(moduleName),
    dto: getDtoFileContent(moduleName),
    entity: getEntityFileContent(moduleName),
    module: getModuleFileContent(moduleName),
    'repository.interface': getRepositoryInterfaceFileContent(moduleName),
    repository: getRepositoryFileContent(moduleName),
  };
};

module.exports = { getFileContent };
