async function complexCheck(checker, checkURLList) {
  const results = [];
  for (let i = 0; i < checkURLList.length; i++) {
    const linkResult = await checker(checkURLList[i]);
    results.push(linkResult);
  }
  return results;
}

module.exports = complexCheck;
