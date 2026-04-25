require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const ADMIN_ID = process.env.ADMIN_ID;

const menu = JSON.parse(fs.readFileSync("./menu.json"));

let users = {};

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🍦 Salom! Muzqaymoq botiga xush kelibsiz!\n/menu ni bosing");
});

bot.onText(/\/menu/, (msg) => {
  const keyboard = menu.map(item => ([{
    text: `${item.name} - ${item.price} so'm`,
    callback_data: item.name
  }]));

  bot.sendMessage(msg.chat.id, "🍦 Muzqaymoq tanlang:", {
    reply_markup: {
      inline_keyboard: keyboard
    }
  });
});

bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const item = menu.find(i => i.name === query.data);

  users[chatId] = { item };

  bot.sendMessage(chatId, `${item.name} tanlandi!\nNechta dona kerak?`);
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  if (!users[chatId] || !users[chatId].item) return;

  if (!users[chatId].count) {
    users[chatId].count = msg.text;
    bot.sendMessage(chatId, "📞 Telefon raqamingizni yuboring:");
    return;
  }

  if (!users[chatId].phone) {
    users[chatId].phone = msg.text;

    const item = users[chatId].item;
    const count = users[chatId].count;
    const total = item.price * count;

    const order = `
🆕 Yangi zakaz!
🍦 ${item.name}
🔢 ${count} dona
💰 ${total} so'm
📞 ${users[chatId].phone}
`;

    bot.sendMessage(chatId, "✅ Zakaz qabul qilindi!");
    bot.sendMessage(ADMIN_ID, order);

    delete users[chatId];
  }
});
