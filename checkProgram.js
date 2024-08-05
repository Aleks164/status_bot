const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const checkURLList = ["https://kvadroom.ru/zhk-novo-molokovo"];
const baseLink = "https://kvadroom.ru";
const headers = {
  "User-Agent": "YandexBot",
};

async function buildComplexCheck() {
  const results = [];
  for (let i = 0; i < checkURLList.length; i++) {
    const linkResult = await getApartmentCount(checkURLList[i]);
    results.push(linkResult);
  }
  return results;
}

function getApartmentCount(link) {
  return axios
    .get(link, { headers })
    .then((response) => {
      var currentPage = response.data;
      const dom = new JSDOM(currentPage);
      var title = dom.window.document.getElementsByClassName(
        "aparts-choose__title"
      )[0];
      const apart = title?.innerHTML.match(/(\d+) квартир/gim)?.[0];
      const apartNumber = +apart?.match(/\d+/gim)?.[0];
      const checkValidApart = (num) => {
        return !isNaN(num) && num > 0;
      };
      if (checkValidApart(apartNumber))
        return { error: false, message: `${link} - ${apart}` };
      return { error: true, message: `!!! ${link} - ${apart} !!!` };
    })
    .catch((error) => {
      return { error: true, message: link + "Error fetching data: " + error };
    });
}

module.exports = buildComplexCheck;

// t.me/quad_status_bot
