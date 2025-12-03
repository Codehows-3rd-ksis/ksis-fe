import { Box } from "@mui/material";
import React, {useMemo} from "react";

// ----------------------
// 1) HTML 문자열 → DOM 객체 변환
// ----------------------
const parseHtmlString = (html: string) => {
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
};

// ----------------------
// 2) 하나의 노드를 재귀적으로 그리는 컴포넌트
// ----------------------
interface DomNodeProps {
  node: Element;
  onNodeClick: (el: Element) => void;
  highlightNodes: (Element | null)[];
}
const colors = [
  "rgba(255, 235, 59, 0.8)",   // 노란색
  "rgba(100, 181, 246, 0.8)",  // 파란색
  "rgba(129, 199, 132, 0.8)",  // 초록색
  "rgba(244, 143, 177, 0.8)",  // 핑크색
//   "rgba(255, 204, 128, 0.8)",  // 주황색
];

// const DomNode: React.FC<DomNodeProps> = ({ node, onNodeClick }) => {
//   return (
//     <div style={{ marginLeft: 12 }}>
//       <span
//         style={{
//           cursor: "pointer",
//           color: "#007acc",
//           fontFamily: "monospace",
//         }}
//         onClick={(e) => {
//           e.stopPropagation();
//           onNodeClick(node);
//         }}
//       >
//         {"<"}
//         {node.tagName.toLowerCase()}
//         {Array.from(node.attributes).map((attr) => (
//           <span key={attr.name} style={{ color: "#b5651d" }}>
//             {" "}
//             {attr.name}="{attr.value}"
//           </span>
//         ))}
//         {">"}
//       </span>

//       {Array.from(node.children).map((child, index) => (
//         <DomNode key={index} node={child} onNodeClick={onNodeClick} />
//       ))}
//     </div>
//   );
// };
const DomNode: React.FC<DomNodeProps> = ({ node, onNodeClick, highlightNodes }) => {
    const highlightIndex = highlightNodes.findIndex(
        (highlightNode) => highlightNode?.isSameNode(node)
    );
    const backgroundColor = highlightIndex >= 0 ? colors[highlightIndex % colors.length] : "transparent";

    const isHighlighted = highlightIndex >= 0;


    return (
      <div style={{ marginLeft: 12 }}>
        <span
          style={{
            cursor: "pointer",
            fontFamily: "monospace",
            background: backgroundColor,
            color: isHighlighted ? "#000" : "#007acc",
            padding: isHighlighted ? "4px 6px" : "0",
            borderRadius: "6px",
            fontWeight: isHighlighted ? "bold" : "normal",
            boxShadow: isHighlighted ? `0 0 5px 2px ${backgroundColor}` : "none",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onNodeClick(node);
          }}
        >
          {"<"}
          {node.tagName.toLowerCase()}
          {Array.from(node.attributes).map((attr) => (
            <span key={attr.name} style={{ color: "#b5651d" }}>
              {" "}
              {attr.name}="{attr.value}"
            </span>
          ))}
          {">"}
        </span>

        {Array.from(node.children).map((child, index) => (
          <DomNode
            key={index}
            node={child}
            onNodeClick={onNodeClick}
            highlightNodes={highlightNodes}
          />
        ))}
      </div>
    );
};

// ----------------------
// 3) Inspector 전체 박스
// ----------------------
const HtmlInspector = ({
  html,
  onNodeClick,
  highlightNodes,
}: {
  html: string;
  onNodeClick: (el: Element) => void;
  highlightNodes: (Element | null)[];
}) => {
  const dom = useMemo(() => parseHtmlString(html), [html]);

  if (!dom.body) return null;

  return (
    <Box
      sx={{
        flex: 1,
        overflow: "auto",
        background: "#fafafa",
        border: "1px solid #ccc",
        padding: 1,
        fontSize: 13,
        fontFamily: "monospace",
      }}
    >
      {Array.from(dom.body.children).map((child: any, i) => (
        <DomNode 
        key={i} 
        node={child} 
        onNodeClick={onNodeClick} 
        highlightNodes={highlightNodes}
        />
      ))}
    </Box>
  );
};

export default HtmlInspector;