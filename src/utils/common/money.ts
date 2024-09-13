export function money_format_with_regex(moneynumber: number, fix = 2) {
  if (typeof moneynumber == "string") {
    moneynumber = parseFloat(moneynumber);
  }
  const money = moneynumber.toFixed(fix);
  return !(money + "").includes(".")
    ? // 就是说1-3位后面一定要匹配3位
      (money + "").replace(/\d{1,3}(?=(\d{3})+$)/g, (match) => {
        return match + ",";
      })
    : (money + "").replace(/\d{1,3}(?=(\d{3})+(\.))/g, (match) => {
        return match + ",";
      });
}
