import React, { Fragment } from "react";
import { styled, themes, convert } from "@storybook/theming";
import { TabsState, Placeholder, Button } from "@storybook/components";
import { List } from "./List";

export const RequestDataButton = styled(Button)({
  marginTop: "1rem",
});

type Results = {
  passes: any [];
  violations: any[];
  needsReview: any[];
};

interface PanelContentProps {
  results: Results;
  fetchData: () => void;
  clearData: () => void;
}

/**
 * Checkout https://github.com/storybookjs/storybook/blob/next/code/addons/jest/src/components/Panel.tsx
 * for a real world example
 */
export const PanelContent: React.FC<PanelContentProps> = ({
  results,
  fetchData,
  clearData,
}) => (
  <TabsState
    initial="overview"
    backgroundColor={convert(themes.normal).background.hoverable}
  >
    <div
      id="overview"
      title="Overview"
      color={convert(themes.normal).color.positive}
    >
      <Placeholder>
        <Fragment>
          Addons can gather details about how a story is rendered. This is panel
          uses a tab pattern. Click the button below to fetch data for the other
          two tabs.
        </Fragment>
        <Fragment>
          <RequestDataButton
            secondary
            small
            onClick={fetchData}
            style={{ marginRight: 16 }}
          >
            Scan
          </RequestDataButton>

          <RequestDataButton outline small onClick={clearData}>
            Clear data
          </RequestDataButton>
        </Fragment>
      </Placeholder>
    </div>
    <div
      id="passes"
      title={`${results.passes.length} Passes`}
      color={convert(themes.normal).color.negative}
    >
      <List items={results.passes} />
    </div>
    <div
      id="violations"
      title={`${results.violations.length} Violations`}
      color={convert(themes.normal).color.negative}
    >
      <List items={results.violations} />
    </div>
    <div
      id="needsReview"
      title={`${results.needsReview.length} Needs Review`}
      color={convert(themes.normal).color.warning}
    >
      <List items={results.needsReview} />
    </div>
  </TabsState>
);
