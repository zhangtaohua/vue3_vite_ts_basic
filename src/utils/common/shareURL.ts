export const addMD5Signature = (url) => {
  const separator = url.indexOf("?") !== -1 ? "&" : "?";
  // 安全问题 暂时去掉token签名
  // var sUrl = url + separator + 'signature=' + md5(token)
  const sUrl = url;
  return sUrl;
};

export const jugeURL = (url) => {
  const str = URL;
  const Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
  const objExp = new RegExp(Expression);
  if (objExp.test(str) === true) {
    return true;
  } else {
    return false;
  }
};
