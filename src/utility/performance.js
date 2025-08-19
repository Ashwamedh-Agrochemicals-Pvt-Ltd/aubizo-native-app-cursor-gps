import React from 'react';

// Memoize FlatList row components for better performance
export const memoizeFlatListRow = (Component, propsAreEqual = null) => {
  return React.memo(Component, propsAreEqual);
};

// Custom props comparison for FlatList items
export const flatListPropsAreEqual = (prevProps, nextProps) => {
  // Compare essential props that would cause re-render
  return (
    prevProps.item?.id === nextProps.item?.id &&
    prevProps.index === nextProps.index &&
    prevProps.selected === nextProps.selected
  );
};

// Lazy load screen component
export const lazyLoadScreen = (importFunc) => {
  return React.lazy(importFunc);
};

// Debounce function for performance
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for performance
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Performance monitoring utility
export const measurePerformance = (name, fn) => {
  if (__DEV__) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  }
  return fn();
};
