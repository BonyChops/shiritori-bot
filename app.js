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

function hiraToKana(str) {
    return str.replace(/[\u3041-\u3096]/g, function(match) {
        var chr = match.charCodeAt(0) + 0x60;
        return String.fromCharCode(chr);
    });
}

const comKanaHira = (content, content2) => {
    return hiraToKana(content) === hiraToKana(content2);
}

const getYomi = (content) => {
    const str = content;
    const data = mecab.parseSync(str);
    const result =  data.reduce((acc, res) => {
        const word = (res[8] !== "*" ? res[8] : res[0]);
        return acc + word;
    }, "");
    return result;
}



const shiri = (msg) => {
    const deleteData = (id) => {
        gameData = gameData.filter(data => data.id !== id);
    }
    const userId = msg.content === "!shiritori-auto" ? client.user.id : msg.author.id;
    if (msg.content.indexOf("!shiritori") !== -1) {
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
            if(userId === client.user.id){
                gameData.find(data => data.id == userId).bot = true;
            }
            if(gameData.find(data => data.id == userId).bot){
                msg.channel.send(firstWord);
            }else{
                msg.reply(`じゃあ俺からね〜\n\`${firstWord}(${getYomi(firstWord)})\``);
            }
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


        if (!comKanaHira(getYomi(userData.word).substr(-1, 1), getYomi(btWord).substr(0, 1))) {
            msg.reply(`しりとりのルールご存知？\`${getYomi(userData.word).substr(-1, 1)}\`→\`${getYomi(btWord).substr(0, 1)}\`は無理があるんだよなwwwwww\nお前の負け〜〜〜w\n前回: \`${userData.word}(${getYomi(userData.word)})\`\n今回: \`${btWord}(${getYomi(btWord)})\``);
            deleteData(userId);
            return;
        }

        if (comKanaHira(getYomi(btWord).substr(-1, 1), "ン")) {
            msg.reply(`しりとりのルールご存知？最後に\`ん\`は敗北宣言って一番言われてるからwwwwww\nお前の負け〜〜〜w\n\`${btWord}(${getYomi(btWord)})\``);
            deleteData(userId);
            return;
        }
        const rtWord = wordDB.find(word => comKanaHira(getYomi(word).substr(0, 1), getYomi(btWord).substr(-1, 1)) && !userData.archive.some(dataWord => comKanaHira(getYomi(dataWord), getYomi(word))) && !comKanaHira(getYomi(word).substr(-1, 1), "ん"));
        if (rtWord === undefined) {
            msg.reply("う〜〜〜ん...参りました...\nお前の勝ちやね。");
            deleteData(userId);
            return;
        }
        gameData.find(data => data.id == userId).archive.push(btWord);
        gameData.find(data => data.id == userId).archive.push(rtWord);
        gameData.find(data => data.id == userId).word = rtWord;
        if(userData.bot){
            msg.channel.send(userData.word);
        }else{
            msg.reply(`\`${userData.word}(${getYomi(userData.word)})\``);
        }
    }
}


client.login(accessToken);