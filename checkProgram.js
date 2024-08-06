const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const checkURLList = [
  "https://kvadroom.ru/zhk-buninskie-kvartaly",
  "https://kvadroom.ru/zhiloy-rayon-skandinaviya",
  "https://kvadroom.ru/zhk-yuzhnye-sady",
  "https://kvadroom.ru/businovskiy-park",
  "https://kvadroom.ru/polar",
  "https://kvadroom.ru/plehanova-11",
  "https://kvadroom.ru/moskvoreche",
  "https://kvadroom.ru/zhk-novo-molokovo",
  "https://kvadroom.ru/zhk-yuzhnaya-dolina",
  "https://kvadroom.ru/zhk-belyj-mys",
  "https://kvadroom.ru/zhk-novoe-pushkino",
  "https://kvadroom.ru/zhk-injoy-indzhoy",
  "https://kvadroom.ru/zhk-novoe-vidnoe",
  "https://kvadroom.ru/zhk-ostafevo",
  "https://kvadroom.ru/zhk-prigorod-lesnoe",
  "https://kvadroom.ru/level-michurinskiy",
  "https://kvadroom.ru/level-nizhegorodskaya",
  "https://kvadroom.ru/rayon-novye-vatutinki",
  "https://kvadroom.ru/zhk-luchi",
  "https://kvadroom.ru/zhk-ravnovesie",
];
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
