/**
 * @description RJ-OL-MAP element
 * @author RJ(zthvivid@163.com)
 */

type EmptyText = {
  text: "";
};

export const wangEditorOlMapType = "RJ-OL-MAP";

export type OlMapElement = {
  type: "RJ-OL-MAP";
  title: string;
  link: string;
  geojson?: any;
  children: EmptyText[]; // void 元素必须有一个空 text
};
