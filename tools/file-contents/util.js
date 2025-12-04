function camelCaseToPascalCase(str) {
  if (!str) return str;

  return str.charAt(0).toUpperCase() + str.slice(1);
}

function camelCaseToScreamingSnakeCase(str) {
  if (!str) return str;

  return str
    .replace(/([A-Z])/g, '_$1') // 대문자 앞에 _ 추가
    .toUpperCase(); // 전체 대문자 변환
}

function camelCaseToKebabCase(str) {
  if (!str) return str; // null, undefined, '' 방어

  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // 소문자/숫자 + 대문자 경계에 - 삽입
    .toLowerCase(); // 전부 소문자로
}

module.exports = { camelCaseToPascalCase, camelCaseToScreamingSnakeCase, camelCaseToKebabCase };
