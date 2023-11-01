import * as React from 'react';
import ReactDOM from 'react-dom';
    
export function setupTest(component: React.ReactElement) {
    // JSDom does not implement this and an error was being
    // thrown from jest-axe because of it.
    const { getComputedStyle } = window;
    window.getComputedStyle = (elt) => getComputedStyle(elt);
    document.documentElement.setAttribute("lang", "en-US");
    if (!document.querySelector("head title")) {
        const title = document.createElement("title");
        title.innerHTML = "Test page";
        document.querySelector("head")?.appendChild(title);
    }
    document.body.innerHTML = `<main><div id="testRoot" /></main>`;
    ReactDOM.render(component, document.getElementById('testRoot'));
}
