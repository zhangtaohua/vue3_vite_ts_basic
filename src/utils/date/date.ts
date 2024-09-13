import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
// import timezone from "dayjs/plugin/timezone";

export function useYMDHMS(time: any = null, ymdSplit: string = "-", hmsSplit: string = ":") {
  let now: Date | null = null;
  if (time) {
    now = new Date(time);
  } else {
    now = new Date();
  }
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const day = now.getDay();

  const hour = "" + now.getHours();
  const minutes = "" + now.getMinutes();
  const seconds = "" + now.getSeconds();

  const yearStr = "" + now.getFullYear();
  const monthStr = ("" + (now.getMonth() + 1)).padStart(2, "0");
  const dateStr = ("" + now.getDate()).padStart(2, "0");
  const dayStr = "" + now.getDay();

  const hourStr = ("" + now.getHours()).padStart(2, "0");
  const minutesStr = ("" + now.getMinutes()).padStart(2, "0");
  const secondsStr = ("" + now.getSeconds()).padStart(2, "0");

  const YM = `${yearStr}${ymdSplit}${monthStr}`;
  const YMD = `${yearStr}${ymdSplit}${monthStr}${ymdSplit}${dateStr}`;
  const HM = `${hourStr}${hmsSplit}${minutesStr}`;
  const HMS = `${hourStr}${hmsSplit}${minutesStr}${hmsSplit}${secondsStr}`;
  const YMDHMS = `${YMD} ${HMS}`;

  return {
    year,
    month,
    date,
    day,
    hour,
    minutes,
    seconds,

    yearStr,
    monthStr,
    dateStr,
    dayStr,
    hourStr,
    minutesStr,
    secondsStr,

    YM,
    YMD,
    HM,
    HMS,
    YMDHMS,

    // YMch,
    // YMDch,
    // HMch,
    // HMSch,
    // YMDHMSch
  };
}

export function parseUtcToLocal(time: string, formatStr = "YYYY-MM-DD HH:mm:ss") {
  dayjs.extend(utc);

  let parsedTime = null;
  if (time) {
    parsedTime = dayjs.utc(time);
  } else {
    parsedTime = dayjs.utc();
  }

  return parsedTime.local().format(formatStr);
}

export function parseLocalToUtc(time: string) {
  dayjs.extend(utc);
  let parsedTime = null;
  if (time) {
    parsedTime = dayjs(time).utc();
  } else {
    parsedTime = dayjs().utc();
  }

  // const formatStr = "YYYY-MM-DDTHH:mm:ss.SSSSSSZ";
  return parsedTime.format();
}

// export function parseLocalToUtc(time: string) {
//   dayjs.extend(utc);
//   // dayjs.extend(timezone);

//   let utcOffsetMinutes = dayjs().utcOffset();

//   let formatStr = "YYYY-MM-DDTHH:mm:ss.SSSSSS";
//   if (utcOffsetMinutes < 0) {
//     formatStr = formatStr + "-";
//   } else {
//     formatStr = formatStr + "+";
//   }

//   utcOffsetMinutes = Math.abs(utcOffsetMinutes);
//   const utcOffsetStr = ("" + Math.ceil(utcOffsetMinutes / 60)).padStart(2, "0") + ":00";
//   formatStr = formatStr + utcOffsetStr;
//   let parsedTime = null;
//   if (time) {
//     parsedTime = dayjs(time).utc(true);
//   } else {
//     parsedTime = dayjs().utc(true);
//   }

//   return parsedTime.format(formatStr);
// }
