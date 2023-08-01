import React, { Fragment } from "react";
import { styled, themes, convert } from "@storybook/theming";
import { TabsState, Placeholder, Button } from "@storybook/components";
import { List } from "./List";
import { Report, RuleDetails } from "src/api/IEngine";

export const RequestDataButton = styled(Button)({
    marginTop: "1rem",
});

type Results = {
    report: Report
};

interface PanelContentProps {
    results: Results;
    fetchData: () => void;
    clearData: () => void;
}

function toItems(report: Report, issues: RuleDetails[]) {
    let mapVals: {
        [ruleId: string]: {
            ruleId: string,
            groupMessage: string,
            issues: RuleDetails[]
        }
    } = {};
    for (const issue of issues) {
        console.log(report.nls[issue.ruleId]);
        mapVals[issue.ruleId] = mapVals[issue.ruleId] || {
            ruleId: issue.ruleId,
            groupMessage: report.nls[issue.ruleId][0],
            issues: []
        };
        mapVals[issue.ruleId].issues.push(issue);
    }
    let retVal: Array<{
        ruleId: string,
        groupMessage: string,
        issues: RuleDetails[]
    }> = [];
    for (const key in mapVals) {
        mapVals[key].groupMessage = `[${mapVals[key].issues.length}] ${mapVals[key].groupMessage}`;
        retVal.push(mapVals[key]);
    }
    return retVal;
}

/**
 * Checkout https://github.com/storybookjs/storybook/blob/next/code/addons/jest/src/components/Panel.tsx
 * for a real world example
 */
export const PanelContent: React.FC<PanelContentProps> = ({
    results,
    fetchData,
    clearData,
}) => {
    let { report } = results;

    let reportDetailV = <></>;
    let reportDetailNR = <></>;
    let reportDetailP = <></>;
    if (report) {
        let notReccomendations = report.results.filter(issue => issue.value[0] === "VIOLATION").filter(issue => issue.ruleId !== "aria_content_in_landmark");
        let passes = notReccomendations.filter(issue => issue.value[1] === "PASS");
        let violations = notReccomendations.filter(issue => issue.value[1] === "FAIL");
        let needsReview = notReccomendations.filter(issues => issues.value[1] === "POTENTIAL" || issues.value[1] === "MANUAL");
        reportDetailV = 
            <div
                id="violations"
                title={`${violations.length} Violations`}
                color={convert(themes.normal).color.negative}
            >
                <List items={toItems(report, violations)} />
            </div>
        reportDetailNR = 
            <div
                id="needsReview"
                title={`${needsReview.length} Needs Review`}
                color={convert(themes.normal).color.warning}
            >
                <List items={toItems(report, needsReview)} />
            </div>;
        reportDetailP =
            <div
                id="passes"
                title={`${passes.length} Passes`}
                color={convert(themes.normal).color.green}
            >
                <List items={toItems(report, passes)} />
            </div>        
    }

    return (
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
            {report && reportDetailV}
            {report && reportDetailNR}
            {report && reportDetailP}
        </TabsState>
    );
};
