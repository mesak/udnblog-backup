const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../config.json');
const reTryTimes = config.udn?.reTryTimes || 3;
const sleepTime = config.udn?.sleepTime || 1000;
const fs = require('fs').promises;
const crypto = require('crypto');


function getCacheFilePath(key, type = 'global', id) {
  const cryptoFileName = md5(key);
  let filePath = `./cache/global/${cryptoFileName}`;
  if(type !== 'global'){
    const fileName = (id) ? `${id}_${cryptoFileName}` : cryptoFileName;
    filePath = `./cache/${type}/${fileName}`;
  }
  return filePath;
}
async function setContentCache(key, content, type = 'global', id) {
  const filePath = getCacheFilePath(key, type, id);
  await fs.writeFile(filePath, content, 'utf8');
  console.log('内容儲存快取到文件:', filePath);
  return content;
}
module.exports.setContentCache = setContentCache;

async function getContentCache(key, callback, type = 'global', id) {
  const filePath = getCacheFilePath(key, type, id);
  try {
    // 檢查快取文件是否存在
    const cacheExists = await checkCacheFileExists(filePath);
    if (cacheExists) {
      console.log('存在快取內容:', key)
      return await fs.readFile(filePath, 'utf8');
    }
    const content = await callback();
    console.log('內容已取得:', key);
    // 将内容写入快取文件
    return await setContentCache(key, content, type, id);
  } catch (error) {
    console.error('取得内容出错:', error);
    throw error;
  }
}
module.exports.getContentCache = getContentCache;

async function unsetContentCache(key, type = 'global', id) {
  const filePath = getCacheFilePath(key, type, id);
  try {
    // 檢查快取文件是否存在
    const cacheExists = await checkCacheFileExists(filePath);
    if (cacheExists) {
      await fs.unlink(filePath);
      console.log('快取文件已删除:', filePath);
    }
  } catch (error) {
    console.error('删除快取文件出错:', error);
    throw error;
  }
}
module.exports.unsetContentCache = unsetContentCache;

// 檢查快取文件是否存在
async function checkCacheFileExists(cacheFilePath) {
  try {
    await fs.access(cacheFilePath);
    return true; // 文件存在
  } catch (error) {
    return false; // 文件不存在
  }
}

function md5(text) {
  const md5 = crypto.createHash('md5');
  md5.update(text);
  const hash = md5.digest('hex');
  return hash;
}


function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
module.exports.sleep = sleep;
async function fetchData(url) {
  try {
    const headers = {
      'Accept': 'text/html',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      // 'Referer': 'https://blog.udn.com/',
      'Connection': 'keep-alive'
    }
    if( url.includes('ajax') ){
      //'x-requested-with': 'XMLHttpRequest',
      headers['X-Requested-With'] = 'XMLHttpRequest'
    }
    const response = await axios.get(url, {
      headers
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching:', error?.response?.status);
    console.error('Error fetching:', error);
    throw new Error('Error fetching');
  }
}
module.exports.fetchData = fetchData;

async function tryFetch(url, times = 0) {
  try {
    const html = await fetchData(url);
    console.log(html)
    return $getContent(html)
  } catch (error) {
    if (times < reTryTimes) {
      console.log(`try to fetch ${url} ${times} times`)
      await sleep(sleepTime)
      return await tryFetch(url, ++times);
    } else {
      throw new Error(`Error fetching url: ${reTryTimes} times`);
    }
  }
}
module.exports.tryFetch = tryFetch;

function $getContent(html) {
  const $ = cheerio.load(html);
  const title = $('title').text();
  const errorTitles = [
    'udn 網路城邦',
    '網路城邦｜錯誤訊息頁'
  ]
  if (errorTitles.includes(title)) {
    throw new Error('Cannot catch content');
  }
  return html
}
