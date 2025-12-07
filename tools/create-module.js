const fs = require('fs');
const path = require('path');
const { camelCaseToKebabCase } = require('./file-contents/util');
const { getFileContent } = require('./file-contents');

const name = process.argv[2];

if (!name) {
  console.error('사용법: node tools/create-module.js <모듈이름>');
  process.exit(1);
} else {
  console.log(`Creating module: ${name}`);
}

function createDirsAndFiles(moduleName) {
  const moduleNameKebab = camelCaseToKebabCase(moduleName);
  const entries = [
    [`${moduleNameKebab}.module.ts`],
    ['application', 'dto', `${moduleNameKebab}.dto.ts`],
    ['application', 'usecases'],
    ['domain', 'entities', `${moduleNameKebab}.entity.ts`],
    ['infrastructure', 'repository', `${moduleNameKebab}.repository.interface.ts`],
    ['infrastructure', 'repository', `${moduleNameKebab}.repository.ts`],
    ['presentation', 'commands', 'handlers'],
    ['presentation', 'controller', `${moduleNameKebab}.controller.ts`],
  ];

  const rootDir = path.resolve(__dirname, '..');
  const baseDir = path.join(rootDir, 'src', 'modules', moduleNameKebab);

  fs.mkdirSync(baseDir, { recursive: true });

  // 파일 콘텐츠 생성
  const fileContents = getFileContent(moduleName);

  for (const parts of entries) {
    const lastPart = parts[parts.length - 1];

    // 파일 인지 체크
    const isFile = lastPart.endsWith('.ts');

    // 폴더 경로 생성
    const dirPath = isFile ? path.join(baseDir, ...parts.slice(0, -1)) : path.join(baseDir, ...parts);

    fs.mkdirSync(dirPath, { recursive: true });

    // 파일이면 파일 생성
    if (isFile) {
      const filePath = path.join(dirPath, lastPart);

      if (!fs.existsSync(filePath)) {
        const fileContent = fileContents[lastPart.replace(`${moduleNameKebab}.`, '').replace('.ts', '')];
        fs.writeFileSync(filePath, fileContent);
        console.log(`Created file: ${filePath}`);
      } else {
        console.log(`Skip file : ${filePath}(이미 존재)`);
      }
    } else {
      console.log(`Created dir: ${dirPath}`);
    }
  }
}

createDirsAndFiles(name);
console.log(`\nModule ${name} created successfully!`);
