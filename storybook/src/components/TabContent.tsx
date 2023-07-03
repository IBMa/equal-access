import React from "react";
import { styled } from "@storybook/theming";
import { H1, Link, Code } from "@storybook/components";

const TabWrapper = styled.div(({ theme }) => ({
  background: theme.background.content,
  padding: "4rem 20px",
  minHeight: "100vh",
  boxSizing: "border-box",
}));

const TabInner = styled.div({
  maxWidth: 768,
  marginLeft: "auto",
  marginRight: "auto",
});

interface TabContentProps {
  code: string;
}

export const TabContent: React.FC<TabContentProps> = ({ code }) => (
  <TabWrapper>
    <TabInner>
      <H1>My Addon</H1>
      <p>
        Your addon can create a custom tab in Storybook. For example, the
        official{" "}
        <Link href="https://storybook.js.org/docs/react/writing-docs/introduction">
          @storybook/addon-docs
        </Link>{" "}
        uses this pattern.
      </p>
      <p>
        You have full control over what content is being rendered here. You can
        use components from{" "}
        <Link href="https://github.com/storybookjs/storybook/tree/next/code/ui/components">
          @storybook/components
        </Link>{" "}
        to match the look and feel of Storybook, for example the{" "}
        <code>&lt;Code /&gt;</code> component below. Or build a completely
        custom UI.
      </p>
      <Code>{code}</Code>
    </TabInner>
  </TabWrapper>
);
