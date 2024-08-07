const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const baseLink = "https://kvadroom.ru";
const headers = {
  "User-Agent": "YandexBot",
};

async function getApartmentCount() {
  return axios
    .get(baseLink, { headers })
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
          message: `${baseLink} - квартиры ...${apartNumber} ЖК ${gkNumber}`,
        };
      return {
        error: true,
        message: `!!! ${baseLink} - квартиры ${apartNumber} ЖК ${gkNumber} !!!`,
      };
    })
    .catch((error) => {
      return {
        error: true,
        message: baseLink + " - Error: " + error,
      };
    });
}

module.exports = getApartmentCount;
