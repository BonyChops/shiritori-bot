const Discord = require('discord.js');
const client = new Discord.Client({ disableEveryone: false });
const MeCab = new require('mecab-async');
const mecab = new MeCab();
const fs = require("fs");
const config = JSON.parse(fs.readFileSync('config.json'));
const accessToken = config.discord.accessToken;
const wordDB = JSON.parse(fs.readFileSync(config.DBPath));
const firstWord = "りんご";
let gameData = [];

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (msg) => {
    shiri(msg);
})

const getYomi = (content) => {
    const kanaToHira = (str) => {
        return str.replace(/[\u30a1-\u30f6]/g, function (match) {
            var chr = match.charCodeAt(0) - 0x60;
            return String.fromCharCode(chr);
        });
    }
    const str = kanaToHira(content);
    const data = mecab.parseSync(str);
    const result =  data.reduce((acc, res) => {
        acc = acc + (res[6] == "*" ? res[0] : res[6]);
        return acc;
    }, "");
    return result;
}



const shiri = (msg) => {
    const deleteData = (id) => {
        gameData = gameData.filter(data => data.id !== id);
    }
    const userId = msg.author.id;
    if (msg.content == "!shiritori") {
        if (gameData.some(data => data.id == userId)) {
            const word = gameData.find(data => data.id == userId).word;
            msg.reply(`ゲームはすでに始まってんよ〜\n\`${word}(${getYomi(word)})\``);
        } else {
            gameData.push({
                id: userId,
                word: firstWord,
                archive: []
            });
            gameData.find(data => data.id == userId).archive.push(firstWord);
            msg.reply(`じゃあ俺からね〜\n\`${firstWord}(${getYomi(firstWord)})\``);
        }
        return;
    }
    if (gameData.some(data => data.id == userId)) {
        const btWord = msg.content.trim();
        const userData = gameData.find(data => data.id == userId);
        if (userData.archive.some(word => getYomi(word) == getYomi(btWord))) {
            msg.reply(`それもう使われてるんだよなw\nお前の負け〜〜〜w\n\`${btWord}(${getYomi(btWord)})\``);
            deleteData(userId);
            return;
        }


        if (getYomi(userData.word).substr(-1, 1) !== getYomi(btWord).substr(0, 1)) {
            msg.reply(`しりとりのルールご存知？\`${getYomi(userData.word).substr(-1, 1)}\`→\`${getYomi(btWord).substr(0, 1)}\`は無理があるんだよなwwwwww\nお前の負け〜〜〜w\n前回: \`${userData.word}(${getYomi(userData.word)})\`\n今回: \`${btWord}(${getYomi(btWord)})\``);
            deleteData(userId);
            return;
        }

        if (getYomi(btWord).substr(-1, 1) === "ん") {
            msg.reply(`しりとりのルールご存知？最後に\`ん\`は敗北宣言って一番言われてるからwwwwww\nお前の負け〜〜〜w\n\`${btWord}(${getYomi(btWord)})\``);
            deleteData(userId);
            return;
        }
        const rtWord = wordDB.find(word => getYomi(word).substr(0, 1) === getYomi(btWord).substr(-1, 1) && !userData.archive.some(dataWord => getYomi(dataWord) === getYomi(word)) && getYomi(word).substr(-1, 1) !== "ん");
        if (rtWord === undefined) {
            msg.reply("う〜〜〜ん...参りました...\nお前の勝ちやね。");
            deleteData(userId);
            return;
        }
        gameData.find(data => data.id == userId).archive.push(btWord);
        gameData.find(data => data.id == userId).archive.push(rtWord);
        gameData.find(data => data.id == userId).word = rtWord;
        msg.reply(`\`${userData.word}(${getYomi(userData.word)})\``);
    }
}


client.login(accessToken);