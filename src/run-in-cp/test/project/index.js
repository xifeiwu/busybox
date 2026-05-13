function getEnvValue() {
  return process.env.VALUE ? parseInt(process.env.VALUE) : 0;
}
function add1(value) {
  const result = (value ?? 0) + 1;
  return result + getEnvValue();
}

function add2(value) {
  const result = (value ?? 0) + 2;
  return result + getEnvValue();
}

module.exports = {add1, add2};
