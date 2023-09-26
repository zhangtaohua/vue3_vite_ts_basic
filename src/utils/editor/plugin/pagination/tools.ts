import { wangEditorPaginationType, PaginationElement } from "@/utils/editor/plugin/pagination/custom-types";

export const A4Width = 21;
export const A4Height = 29.7;
export const A4PrintDPI = 96;
export const inchCm = 2.54;

export const A4WidthPixel = (A4Width * A4PrintDPI) / inchCm;
export const A4HeightPixel = (A4Height * A4PrintDPI) / inchCm;

export const A4EditorHeightPixel = ((A4Height - 4.01) * A4PrintDPI) / inchCm; // 971.33

export const blankParagraphHeight = 52;
export const blankParagraphRHeight = 21 + 15;
export const paginationGap = (2 * A4PrintDPI) / inchCm; // 因为是2cm的占度
export const topPaginationTag: PaginationElement = {
  type: wangEditorPaginationType,
  page: 1,
  width: 0,
  height: 0,
  children: [{ text: "" }],
};

export function insertPageHeader(editor: any) {
  editor.clear();
  editor.insertNode(topPaginationTag);

  const children = [...editor.children];
  children.shift();
  editor.children = children;
  // editor.updateView();
}

export function adjustPagePagination(editor: any) {
  const oldChildren = [...editor.children];
  const newChildren = [{ ...topPaginationTag }];

  // 用来计算一页的高度
  let oldPageHeight = 0;
  let pageHeight = 0;
  let currentPage = 1;

  const oldChildrenLength = oldChildren.length;
  console.log("oldChildrenLength", oldChildrenLength, editor);
  // 这是为了删除第一行后，还能继续编辑
  if (oldChildrenLength === 1) {
    newChildren.push({ type: "paragraph", children: [{ text: "" }] });
  }

  for (let i = 1; i < oldChildrenLength; i++) {
    const child = oldChildren[i];
    // 如果是自定义的分布占位符，直接不处理。
    if (child.type == wangEditorPaginationType) {
      continue;
    } else {
      let dom = null;
      try {
        dom = editor.toDOMNode(child);
      } catch (error) {
        console.log("editor.toDOMNode() 出错", error);
      }
      let domHeight = 0;
      if (dom) {
        const domOffsetHeight = dom.offsetHeight;
        const computedStyle = window.getComputedStyle(dom);
        const marginTop = parseInt(computedStyle.marginTop, 10);
        const marginBottom = parseInt(computedStyle.marginBottom, 10);
        const nextChild = oldChildren[i + 1];
        if (nextChild) {
          if (nextChild.type == "paragraph") {
            domHeight = domOffsetHeight + marginTop;
          } else {
            domHeight = domOffsetHeight + marginTop + marginBottom;
          }
        } else {
          domHeight = domOffsetHeight + marginTop + marginBottom;
        }
      } else {
        continue;
      }
      pageHeight = pageHeight + domHeight;
      console.log("domHeight", pageHeight, oldPageHeight, domHeight, A4EditorHeightPixel);
      if (pageHeight >= A4EditorHeightPixel) {
        // 计算剩余空间大小，如果大于一行距离，就插入一个或一些空行
        let blankGap = A4EditorHeightPixel - oldPageHeight;
        console.log("blankGap", blankGap);
        if (blankGap > blankParagraphHeight) {
          while (blankGap > blankParagraphHeight) {
            newChildren.push({
              type: "paragraph",
              children: [{ text: "" }],
            });
            blankGap = blankGap - blankParagraphRHeight;
          }
        }

        // 插入自定义的页面标记
        currentPage = currentPage + 1;
        const needGapHeight = paginationGap + Math.ceil(blankGap);

        console.log("needGapHeight", needGapHeight);

        newChildren.push({
          type: wangEditorPaginationType,
          page: currentPage,
          width: 0,
          height: needGapHeight,
          children: [{ text: "" }],
        });

        // 再把原元素插入
        newChildren.push(child);

        // 清空高度
        oldPageHeight = 0;
        pageHeight = 0;
      } else {
        newChildren.push(child);
        oldPageHeight = pageHeight;
      }
    }
  }

  editor.children = newChildren;
  editor.updateView();
}
