/**
 * @description OL-MAP element
 * @author RJ(zthvivid@163.com)
 */

type EmptyText = {
  text: "";
};

export type OlMapElement = {
  type: "OL-MAP";
  title: string;
  link: string;
  geojson?: any;
  children: EmptyText[]; // void 元素必须有一个空 text
};
