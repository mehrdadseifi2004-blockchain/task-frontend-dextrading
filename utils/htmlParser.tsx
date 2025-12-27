import parse, { HTMLReactParserOptions, Element, domToReact, DOMNode } from "html-react-parser";
import { ReactNode } from "react";

function normalizeHtml(html: string): string {
  let normalized = html;
  
  const removeNestedTags = (tag: string, replacement: string = "") => {
    const openTag = new RegExp(`<${tag}[^>]*>`, "gi");
    const closeTag = new RegExp(`</${tag}>`, "gi");
    normalized = normalized.replace(openTag, replacement);
    normalized = normalized.replace(closeTag, replacement);
  };
  
  removeNestedTags("details");
  removeNestedTags("summary");
  
  normalized = normalized.replace(/<[^>]+\s+hidden(?:\s|>)/gi, "");
  normalized = normalized.replace(/<[^>]+\s+style\s*=\s*["'][^"']*display\s*:\s*none[^"']*["'][^>]*>/gi, "");
  normalized = normalized.replace(/<[^>]+\s+style\s*=\s*["'][^"']*visibility\s*:\s*hidden[^"']*["'][^>]*>/gi, "");
  
  normalized = normalized.replace(/<div[^>]*>/gi, "<p>");
  normalized = normalized.replace(/<\/div>/gi, "</p>");
  removeNestedTags("span");
  
  normalized = normalized.replace(/<h[1-6][^>]*>/gi, (match) => {
    if (match.includes("h1") || match.includes("h2")) {
      return match.replace(/h[12]/, "h2");
    }
    return "<h2>";
  });
  normalized = normalized.replace(/<\/h[1-6]>/gi, "</h2>");
  
  normalized = normalized.replace(/<ol[^>]*>/gi, "<ul>");
  normalized = normalized.replace(/<\/ol>/gi, "</ul>");
  
  normalized = normalized.replace(/<blockquote[^>]*>/gi, "<p>");
  normalized = normalized.replace(/<\/blockquote>/gi, "</p>");
  
  removeNestedTags("strong");
  removeNestedTags("b");
  removeNestedTags("em");
  removeNestedTags("i");
  removeNestedTags("a");
  removeNestedTags("img");
  removeNestedTags("br");
  removeNestedTags("hr");
  removeNestedTags("code");
  
  normalized = normalized.replace(/<pre[^>]*>/gi, "<p>");
  normalized = normalized.replace(/<\/pre>/gi, "</p>");
  
  normalized = normalized.replace(/<p>\s*<\/p>/gi, "");
  normalized = normalized.replace(/(<p>)\s*(<p>)/gi, "$1$2");
  normalized = normalized.replace(/(<\/p>)\s*(<\/p>)/gi, "$1$2");
  
  return normalized;
}

export function parseHtmlToReact(html: string): ReactNode {
  const normalizedHtml = normalizeHtml(html);
  
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.attribs) {
        const { name, attribs, children } = domNode;
        
        if (attribs.hidden || attribs.style?.includes("display:none") || attribs.style?.includes("visibility:hidden")) {
          return <></>;
        }
        
        const props: Record<string, any> = {};
        
        if (attribs.class && !attribs.class.includes("hidden")) {
          props.className = attribs.class;
        }
        
        const childNodes = children ? (children as unknown as DOMNode[]) : [];
        const childElements = childNodes.length > 0 
          ? domToReact(childNodes, options) 
          : null;
        
        switch (name) {
          case "p":
            return <p {...props}>{childElements}</p>;
          case "h2":
            return <h2 {...props}>{childElements}</h2>;
          case "ul":
            return <ul {...props}>{childElements}</ul>;
          case "li":
            return <li {...props}>{childElements}</li>;
          default:
            return <>{childElements}</>;
        }
      }
      return undefined;
    },
  };
  
  return parse(normalizedHtml, options);
}

