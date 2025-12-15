import { Box } from "@mui/material";
import React, { useMemo, useEffect, useRef } from "react";

// ----------------------
// 1) HTML 문자열 → DOM 객체 변환
// ----------------------
const parseHtmlString = (html: string) => {
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
};

// ----------------------
// 2) 재귀 DOM 렌더링 컴포넌트
// ----------------------
interface DomNodeProps {
  node: Element;
  onNodeClick: (el: Element) => void;
  highlightNodes: {
    [target: string]: Element | undefined;
  };
  registerDomRef: (el: Element, ref: HTMLDivElement) => void;
}

const colors = [
  "rgba(255, 235, 59, 0.8)",
  "rgba(100, 181, 246, 0.8)",
  "rgba(129, 199, 132, 0.8)",
  "rgba(244, 143, 177, 0.8)",
];

const DomNode: React.FC<DomNodeProps> = React.memo(
  ({ node, onNodeClick, highlightNodes, registerDomRef }) => {
    const divRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (divRef.current) {
        registerDomRef(node, divRef.current); 
      }
    }, [node]);
    const entries = Object.entries(highlightNodes);

    let isHighlighted = false;
    let highlightColor = "transparent";

    for (let i = 0; i < entries.length; i++) {
      const [, el] = entries[i];
      if (el?.isSameNode(node)) {
        isHighlighted = true;
        highlightColor = colors[i % colors.length];
        break;
      }
    }

    return (
      <div ref={divRef} style={{ marginLeft: 12 }}>
        <span
          style={{
            cursor: "pointer",
            fontFamily: "monospace",
            background: highlightColor,
            color: isHighlighted ? "#000" : "#007acc",
            padding: isHighlighted ? "4px 6px" : "0",
            borderRadius: "6px",
            fontWeight: isHighlighted ? "bold" : "normal",
            boxShadow: isHighlighted
              ? `0 0 5px 2px ${highlightColor}`
              : "none",
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
            registerDomRef={registerDomRef}
          />
        ))}
      </div>
    );
  }
);

// ----------------------
// 3) Inspector 전체 박스
// ----------------------
const HtmlInspector = ({
  html,
  onNodeClick,
  highlightNodes,
  registerDomRef 
}: {
  html: string;
  onNodeClick: (el: Element) => void;
  highlightNodes: { [target: string]: Element | undefined };
  registerDomRef: (el: Element, ref: HTMLDivElement) => void;
}) => {
  const dom = useMemo(() => parseHtmlString(html), [html]);

  if (!dom.body) return null;

  return (
    <Box
      sx={{
        flex: 1,
        // overflow: "auto",
        // border: "1px solid #ccc",
        background: "#fafafa",
        padding: 1,
        fontSize: 13,
        fontFamily: "monospace",
      }}
      data-scroll-container
    >
      {Array.from(dom.body.children).map((child, i) => (
        <DomNode
          key={i}
          node={child}
          onNodeClick={onNodeClick}
          highlightNodes={highlightNodes}
          registerDomRef ={registerDomRef}
        />
      ))}
    </Box>
  );
};

export default HtmlInspector;