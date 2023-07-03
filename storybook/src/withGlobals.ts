import type {
  Renderer,
  PartialStoryFn as StoryFunction,
  StoryContext,
} from "@storybook/types";
import { useEffect, useGlobals } from "@storybook/preview-api";
import { PARAM_KEY } from "./constants";

export const withGlobals = (
  StoryFn: StoryFunction<Renderer>,
  context: StoryContext<Renderer>
) => {
  const [globals] = useGlobals();
  const myAddon = globals[PARAM_KEY];
  // Is the addon being used in the docs panel
  const isInDocs = context.viewMode === "docs";
  const { theme } = context.globals;

  useEffect(() => {
    // Execute your side effect here
    // For example, to manipulate the contents of the preview
    const selector = isInDocs
      ? `#anchor--${context.id} .sb-story`
      : "#storybook-root";

    displayToolState(selector, {
      myAddon,
      isInDocs,
      theme,
    });
  }, [myAddon, theme]);

  return StoryFn();
};

function displayToolState(selector: string, state: any) {
  const rootElements = document.querySelectorAll(selector);

  rootElements.forEach((rootElement) => {
    let preElement = rootElement.querySelector<HTMLPreElement>(
      `${selector} pre`
    );

    if (!preElement) {
      preElement = document.createElement("pre");
      preElement.style.setProperty("margin-top", "2rem");
      preElement.style.setProperty("padding", "1rem");
      preElement.style.setProperty("background-color", "#eee");
      preElement.style.setProperty("border-radius", "3px");
      preElement.style.setProperty("max-width", "600px");
      preElement.style.setProperty("overflow", "scroll");
      rootElement.appendChild(preElement);
    }

    preElement.innerText = `This snippet is injected by the withGlobals decorator.
It updates as the user interacts with the ⚡ or Theme tools in the toolbar above.

${JSON.stringify(state, null, 2)}
`;
  });
}
