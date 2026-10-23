import { createRoot } from "react-dom/client";
import { unstableSetRender } from "antd";

// Ant Design 5's static Modal/message APIs need a React 19 render adapter.
const roots = new WeakMap();
unstableSetRender((node, container) => {
  let root = roots.get(container);
  if (!root) {
    root = createRoot(container);
    roots.set(container, root);
  }
  root.render(node);
  return async () => {
    // Unmount outside the current render/commit stack.
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    if (roots.get(container) === root) {
      root.unmount();
      roots.delete(container);
    }
  };
});
