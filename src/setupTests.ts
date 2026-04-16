import '@testing-library/jest-dom';

// jsdom doesn't implement ResizeObserver; @xyflow/react requires it.
window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
