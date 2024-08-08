const { Telegraf } = require("telegraf");
const apartmentGroupCheck = require("./apartmentGroupCheck.js");
const buildComplexCheck = require("./buildComplexCheck.js");
require("dotenv/config");

const key = process.env.BOT_TOKEN;
const targetId = process.env.TARGET_ID;
const myId = process.env.MY_ID;
const timeInterval = 60 * 1000 * 10; // 10 minute

let checkSummary = [];
let lastCheckTime = "";
let isCheckRunning = true;
let timeOutId;

const helpMessage =
  "Основные комманды:\n/start - начать проверку\n/lastCheck - последний результат\n/stop - остановить проверку\n/help - Основные комманды";

const bot = new Telegraf(key);

bot.start((ctx) => ctx.reply(helpMessage));
bot.launch();

const tryCheck = async () => {
  const apartmentGroup = await apartmentGroupCheck();
  const buildComplex = await buildComplexCheck();
  lastCheckTime = new Date().toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
  });
  checkSummary = [
    {
      message: "группировки жк",
    },
    ...apartmentGroup,
    {
      message: "ЖК",
    },
    ...buildComplex,
  ];
  const apartmentGroupErrors = apartmentGroup.filter((item) => item.error);
  const buildComplexErrors = buildComplex.filter((item) => item.error);
  if (apartmentGroupErrors.length || buildComplexErrors.length) {
    const preparedGroup = apartmentGroupErrors.length
      ? [
          {
            message: "группировки жк",
          },
          ...apartmentGroupErrors,
        ]
      : [];
    const preparedGroupBuild = buildComplexErrors.length
      ? [
          {
            message: "ЖК",
          },
          ...buildComplexErrors,
        ]
      : [];
    const answer = [
      lastCheckTime + " мск",
      ...[...preparedGroup, ...preparedGroupBuild].map(
        (check) => check.message
      ),
    ].join("\n");
    bot.telegram.sendMessage(myId, answer);
    bot.telegram.sendMessage(targetId, answer);
  }
};

const doTick = () => {
  if (isCheckRunning) {
    timeOutId = setTimeout(async () => {
      await tryCheck();
      doTick();
    }, timeInterval);
  } else clearTimeout(timeOutId);
};
doTick();
setTimeout(tryCheck, 10000);

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
      isCheckRunning = false;
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
