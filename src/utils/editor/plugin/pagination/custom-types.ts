/**
 * @description OL-MAP element
 * @author RJ(zthvivid@163.com)
 */

type EmptyText = {
  text: "";
};

export const wangEditorPaginationType = "RJ-PAGINATION";

export type PaginationElement = {
  type: "RJ-PAGINATION";
  page: number;
  width: number;
  height: number;
  children: EmptyText[]; // void 元素必须有一个空 text
};
