import parse, { HTMLReactParserOptions, Element, domToReact, DOMNode } from "html-react-parser";
import { ReactNode } from "react";

export function parseHtmlToReact(html: string): ReactNode {
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.attribs) {
        const { name, attribs, children } = domNode;
        const props: Record<string, any> = {};
        
        Object.keys(attribs).forEach((key) => {
          if (key === "class") {
            props.className = attribs[key];
          } else {
            props[key] = attribs[key];
          }
        });
        
        const childNodes = children ? (children as unknown as DOMNode[]) : [];
        const childElements = childNodes.length > 0 
          ? domToReact(childNodes, options) 
          : null;
        
        switch (name) {
          case "p":
            return <p {...props}>{childElements}</p>;
          case "h1":
            return <h1 {...props}>{childElements}</h1>;
          case "h2":
            return <h2 {...props}>{childElements}</h2>;
          case "h3":
            return <h3 {...props}>{childElements}</h3>;
          case "h4":
            return <h4 {...props}>{childElements}</h4>;
          case "h5":
            return <h5 {...props}>{childElements}</h5>;
          case "h6":
            return <h6 {...props}>{childElements}</h6>;
          case "ul":
            return <ul {...props}>{childElements}</ul>;
          case "ol":
            return <ol {...props}>{childElements}</ol>;
          case "li":
            return <li {...props}>{childElements}</li>;
          case "div":
            return <div {...props}>{childElements}</div>;
          case "span":
            return <span {...props}>{childElements}</span>;
          case "strong":
            return <strong {...props}>{childElements}</strong>;
          case "em":
            return <em {...props}>{childElements}</em>;
          case "b":
            return <b {...props}>{childElements}</b>;
          case "i":
            return <i {...props}>{childElements}</i>;
          case "a":
            return <a {...props}>{childElements}</a>;
          case "img":
            return <img {...props} />;
          case "br":
            return <br {...props} />;
          case "hr":
            return <hr {...props} />;
          case "blockquote":
            return <blockquote {...props}>{childElements}</blockquote>;
          case "code":
            return <code {...props}>{childElements}</code>;
          case "pre":
            return <pre {...props}>{childElements}</pre>;
        }
      }
      return undefined;
    },
  };
  
  return parse(html, options);
}

