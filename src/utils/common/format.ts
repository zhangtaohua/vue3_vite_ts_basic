import { formatTimeToStr } from "./date";
import { getDict } from "./dictionary";
import globalUseVar from "@/utils/common/globalUseVar";
//let satelliteList = [];
import { useUserStore } from "@/store/user";
const satelliteStore = useUserStore();
// const language = userStore.getLanguage();
export const formatBoolean = (bool) => {
  if (bool !== null) {
    return bool ? globalUseVar.t("general.yes") : globalUseVar.t("general.no");
  } else {
    return "";
  }
};
export const formatDate = (time) => {
  if (time !== null && time !== "") {
    var date = new Date(time);
    return formatTimeToStr(date, "yyyy-MM-dd hh:mm:ss");
  } else {
    return "";
  }
};
export const formatDateDay = (time) => {
  if (time !== null && time !== "") {
    var date = new Date(time);
    return formatTimeToStr(date, "MM-dd hh:mm:ss");
  } else {
    return "";
  }
};
export const formatDateOnly = (time) => {
  if (time !== null && time !== "") {
    var date = new Date(time);
    return formatTimeToStr(date, "yyyy-MM-dd");
  } else {
    return "";
  }
};

export const formatDatedot = (time) => {
  if (time !== null && time !== "") {
    var date = new Date(time);
    return formatTimeToStr(date, "yyyy.MM.dd");
  } else {
    return "";
  }
};

export const filterDict = (value, options) => {
  if (value != undefined && value != null && value !== "" && options.length) {
    const rowLabel = options && options.filter((item) => item.value == value);
    if (rowLabel && rowLabel[0]) {
      return rowLabel[0][globalUseVar.t("general.language")];
    } else {
      return "";
    }
  } else {
    return "";
  }
};

export const filterSatellite = (value, options) => {
  // console.log(options)
  if (value != undefined && value != null && value !== "" && options.length) {
    const rowLabel = options && options.filter((item) => item.satelliteCode == value);

    if (rowLabel && rowLabel[0]) {
      return {
        labelCn: rowLabel[0].satelliteNameCn,
        labelEn: rowLabel[0].satelliteNameEn,
      };
    } else {
      return "";
    }
  } else {
    return "";
  }
};

export const filterSatelliteCode = (value) => {
  const satelliteList = satelliteStore.getSatelliteList();
  // console.log(option.value)
  if (value != undefined && value != null && value !== "" && satelliteList.value.length > 0) {
    const rowLabel =
      satelliteList.value && satelliteList.value.filter((item) => item.satelliteCode && item.satelliteCode == value);
    if (rowLabel && rowLabel[0]) {
      return rowLabel[0][globalUseVar.t("general.satellite")];
    } else {
      return "";
    }
  } else {
    return "";
  }
};

// const getSatelliteListData = async () => {
//   const satellitetable = await getResSatelliteAllList({});
//   satelliteList = satellitetable.data;
// };

export const getDictFunc = async (type) => {
  const dicts = await getDict(type);
  return dicts;
};
