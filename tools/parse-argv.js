

module.exports = function(ClassName) {

  const functionList = Object.getOwnPropertyNames(ClassName.prototype).filter(it => !it.startsWith('_'))

  if (process.argv.length === 2) {
    console.log(functionList);
  } else {
    const obj = new ClassName();
    const funcName = process.argv[2];
    if (functionList.includes(funcName)) {
      const result = obj[funcName](...process.argv.slice(3));
      console.log(result);
    } else {
      console.log(`function ${funcName} not exist`);
    }
  }
}