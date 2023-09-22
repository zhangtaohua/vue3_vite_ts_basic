// 此文件函数用于处理html 字符串中 <img> 标签 token的问题
import { h, render } from "vue";

const imgReg = /<img.*?(?:>|\/>)/gi; //匹配图片中的img标签
const srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i; // 匹配图片中的srcc
const tokenReg = /\?token=.*?\"/gi; // 匹配 ?token= 到结尾的部分

export function trimTokenInImgTagByReg(htmlText: string) {
  let newHtmlText = htmlText;
  // 获取迭代器
  const imgArrayIt = htmlText.matchAll(imgReg);
  // 一个一个的删除 token 并替换
  for (const imgStrItem of imgArrayIt) {
    // console.log("imgi", imgStrItem);
    let originImgStr = imgStrItem[0];
    const imgStrArr = originImgStr.match(srcReg);
    // console.log("imgStrArr", imgStrArr);
    let imgStr = "";
    if (imgStrArr && imgStrArr.length) {
      imgStr = imgStrArr[0].replace(tokenReg, '"');
      originImgStr = originImgStr.replace(imgStrArr[0], imgStr);
    }
    // console.log("imgStr", imgStr, originImgStr);
    newHtmlText = newHtmlText.replace(imgStrItem[0], originImgStr);
  }
  // console.log("newHtmlText", newHtmlText, newHtmlText.length);
  return newHtmlText;
}

export function addTokenInImgTagByReg(htmlText: string, token: string) {
  let newHtmlText = htmlText;
  // 获取迭代器
  const imgArrayIt = htmlText.matchAll(imgReg);
  // 一个一个的增加 token 并替换
  for (const imgStrItem of imgArrayIt) {
    let originImgStr = imgStrItem[0];
    const imgStrArr = originImgStr.match(srcReg);
    let imgStr = "";
    if (imgStrArr && imgStrArr.length) {
      imgStr = imgStrArr[0].slice(0, imgStrArr[0].length - 1) + `?token=${token}"`;
      originImgStr = originImgStr.replace(imgStrArr[0], imgStr);
    }

    newHtmlText = newHtmlText.replace(imgStrItem[0], originImgStr);
  }
  return newHtmlText;
}

// 此函数写在此给自己一个参考，最好不要用这个。 还是用上面的 正则的方法
// 此函数针对转换结果有两个问题(仅目前发现的)：
// 1、style 中 带有0的小数点会被抹掉， 例如 style="width: 100.00px" 得到结果是 style="width: 100px"
// 2、<img scr="" />  中 结尾符 “/” 也会被抹掉
export function trimTokenInImgTagByDom(htmlText: string) {
  const vueTemplate = {
    // template: `<template>${htmlText}</template>`,
    template: `${htmlText}`,
  };

  // const vueIns = createApp(vueTemplate);
  const div = document.createElement("div");

  const vNode = h(vueTemplate);
  render(vNode, div);
  // console.log("vNode", vNode, div);
  const imgArray = div.getElementsByTagName("img");
  // console.log("imgArray", imgArray);

  if (imgArray && imgArray.length) {
    for (let i = 0; i < imgArray.length; i++) {
      const imgItem = imgArray[i];
      const imgSrc = imgItem.getAttribute("src") + '"';

      const newImgSrc = imgSrc?.replace(tokenReg, "") || "";
      // console.log("newImgSrc", typeof imgSrc, imgSrc, newImgSrc);
      imgItem.setAttribute("src", newImgSrc);
    }
  }

  const newHtmlText = div.innerHTML;
  return newHtmlText;
}

export function addTokenInImgTagByDom(htmlText: string, token: string) {
  const vueTemplate = {
    template: `${htmlText}`,
  };

  const div = document.createElement("div");
  const vNode = h(vueTemplate);
  render(vNode, div);
  const imgArray = div.getElementsByTagName("img");

  if (imgArray && imgArray.length) {
    for (let i = 0; i < imgArray.length; i++) {
      const imgItem = imgArray[i];
      const imgSrc = imgItem.getAttribute("src");

      const newImgSrc = imgSrc + `?token=${token}`;
      imgItem.setAttribute("src", newImgSrc);
    }
  }

  const newHtmlText = div.innerHTML;
  return newHtmlText;
}
