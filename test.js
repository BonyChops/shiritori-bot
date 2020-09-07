const MeCab = new require('mecab-async');
const mecab = new MeCab();
console.log(mecab.parseSync("ツイート"))
console.log(mecab.parseSync("ツイート")[0][8]);