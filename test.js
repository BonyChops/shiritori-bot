const MeCab = new require('mecab-async');
const mecab = new MeCab();
console.log(mecab.parseSync("読めねえよ"))
console.log(mecab.parseSync("読めねえよ")[0][6]);