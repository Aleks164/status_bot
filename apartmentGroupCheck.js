const axios = require("axios");
const jsdom = require("jsdom");
const complexCheck = require("./complexCheck");
const { JSDOM } = jsdom;

const checkURLList = [
  "https://kvadroom.ru",
  "https://kvadroom.ru/novostroyki",
  "https://kvadroom.ru/metro/avtozavodskaya",
  "https://kvadroom.ru/metro/tyepljyji_stan",
  "https://kvadroom.ru/metro/planernaya",
  "https://kvadroom.ru/metro/filatov_lug_2019",
  "https://kvadroom.ru/novostroyki/pik",
  "https://kvadroom.ru/novostroyki/seriya-plyus",
  "https://kvadroom.ru/novostroyki/level-group-level-grupp",
  "https://kvadroom.ru/novostroyki/ooo-a101",
  "https://kvadroom.ru/novostroyki/gotovye-moskva",
  "https://kvadroom.ru/novostroyki/stroyashiesya",
];
const headers = {
  "User-Agent": "YandexBot",
};

async function apartmentGroupCheck() {
  return await complexCheck(getApartmentCount, checkURLList);
}

async function getApartmentCount(link) {
  return axios
    .get(link, { headers })
    .then((response) => {
      var currentPage = response.data;

      const dom = new JSDOM(currentPage);
      var listingHeader = dom.window.document.getElementsByClassName(
        "buildings-list__title"
      )[0];
      const apart = listingHeader?.innerHTML.match(/(\d+) квартир/gim)?.[0];
      const gk = listingHeader?.innerHTML.match(/(\d+) ЖК/gim)?.[0];
      const apartNumber = +apart?.match(/\d+/gim)?.[0];
      const gkNumber = +gk?.match(/\d+/gim)?.[0];
      const checkValidApart = (num) => {
        return !isNaN(num) && num > 0;
      };
      if (checkValidApart(apartNumber) && checkValidApart(gkNumber))
        return {
          error: false,
          message: `${link} - квартиры ...${apartNumber} ЖК ${gkNumber}`,
        };
      return {
        error: true,
        message: `!!! ${link} - квартиры ${apartNumber} ЖК ${gkNumber} !!!`,
      };
    })
    .catch((error) => {
      return {
        error: true,
        message: link + " - Error: " + error,
      };
    });
}

module.exports = apartmentGroupCheck;
