const { Telegraf } = require("telegraf");
const getApartmentCount = require("./testMainApart");
const buildComplexCheck = require("./checkProgram");
require("dotenv/config");

const key = process.env.BOT_TOKEN;
// const targetId = process.env.TARGET_ID;
const myId = process.env.MY_ID;
const timeInterval = 60 * 1000; // 1 minute

let checkSummary = [];
let lastCheckTime = "";
let isCheckRunning = true;
let timeOutId;

const helpMessage =
  "Основные комманды:\n/start - начать проверку\n/lastCheck - последний результат\n/stop - остановить проверку?\n/help - Основные комманды";

// const bot = new Telegraf(process.env.BOT_TOKEN);
const bot = new Telegraf(key);

bot.start((ctx) => ctx.reply(helpMessage));
bot.launch();

const doTick = () => {
  if (isCheckRunning)
    timeOutId = setTimeout(async () => {
      const mainList = await getApartmentCount();
      const buildComplex = await buildComplexCheck();
      lastCheckTime = new Date().toLocaleString("ru-RU", {
        timeZone: "Europe/Moscow",
      });
      checkSummary = [mainList, ...buildComplex];
      const errors = checkSummary.filter((item) => item.error);
      if (errors.length)
        bot.telegram.sendMessage(
          myId,
          [
            lastCheckTime + " мск",
            ...checkSummary.map((check) => check.message),
          ].join("\n")
        );
      // bot.telegram.sendMessage(targetId, checkSummary);
      doTick();
    }, timeInterval);
  else clearTimeout(timeOutId);
};
doTick();

bot.on("message", (ctx) => {
  bot.telegram.sendMessage(
    myId,
    ctx.update.message.from.username + " : " + ctx.update.message.text
  );
  switch (ctx.update.message.text) {
    case "/start": {
      if (isCheckRunning) return ctx.reply("Bot is already running");
      isCheckRunning = true;
      doTick();
      return ctx.reply("Bot started");
    }
    case "/stop": {
      clearTimeout(timeOutId);
      return ctx.reply("Bot stopped");
    }
    case "/lastCheck": {
      return ctx.reply(
        checkSummary.length
          ? [
              lastCheckTime + " мск",
              ...checkSummary.map((check) => check.message),
            ].join("\n")
          : "wait for the result..., check later"
      );
    }
    case "/help": {
      return ctx.reply(helpMessage);
    }
    default: {
      return ctx.reply("Unknown command");
    }
  }
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
