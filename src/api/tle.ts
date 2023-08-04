import axios from "axios";

const BASE_URL = "https://celestrak.org";

function getTleDataFromExternal(path = "") {
  const uri = `${BASE_URL}/NORAD/elements/gp.php?GROUP=${path}&FORMAT=tle`;
  return axios.get(uri).then((res: any) => {
    if (res.status === 200) {
      console.log("获取TLE成功");
      localStorage.setItem(path, res.data); // 缓存TLE数据，减轻数据服务压力
      return Promise.resolve(res.data);
    } else {
      console.error("获取TLE失败");
      return Promise.reject(res.statusText);
    }
  });
}

export { getTleDataFromExternal };
