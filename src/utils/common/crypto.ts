import CryptoJS from 'crypto-js'

/**
     * @param {*需要加密的字符串 注：对象转化为json字符串再加密} word
     * @param {*aes加密需要的key值，这个key值后端同学会告诉你，就是秘钥} keyStr
     */
export const encrypt = (word, keyStr) => { // 加密
  const key = CryptoJS.enc.Utf8.parse(keyStr)

  const srcs = CryptoJS.enc.Utf8.parse(word)

  const encrypted = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }) // 加密模式为ECB，补码方式为PKCS5Padding（也就是PKCS7）

  return encrypted.toString()
}

export const decrypt = (word, keyStr) => { // 解密
  const key = CryptoJS.enc.Utf8.parse(keyStr)

  const decrypt = CryptoJS.AES.decrypt(word, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 })

  return CryptoJS.enc.Utf8.stringify(decrypt).toString()
}

