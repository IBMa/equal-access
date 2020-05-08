const fs = require("fs");
const gulp = require('gulp');
var replace = require('gulp-replace');
var ext_replace = require('gulp-ext-replace');

const componentHeader = `import React, { ReactNode } from "react";
import Markdown from 'markdown-to-jsx';
import { IReportItem, IReport } from '../devtools/Report';
import Violation16 from "../../assets/Violation16.svg";
import NeedsReview16 from "../../assets/NeedsReview16.svg";
import Recommendation16 from "../../assets/Recommendation16.svg";

import {
    OrderedList, UnorderedList, ListItem, CodeSnippet
} from 'carbon-components-react';

const Row = ({ children }: any) => {
    return <div className="bx--row">{children}</div>
}

const Column = ({ children, colLg, colMd, colSm, className }: any) => {
    let cls = "";
    if (className) {
        cls = \`\${cls} \${className}\`;
    }
    if (colSm) {
        cls = \`\${cls} bx--col-sm-\${colSm}\`;
    }
    if (colMd) {
        cls = \`\${cls} bx--col-md-\${colMd}\`;
    }
    if (colLg) {
        cls = \`\${cls} bx--col-lg-\${colLg}\`;
    }
    cls = cls.trim();
    return <div className={\`\${cls}\`}>{children}</div>
}
interface IHelpFileProps {
    report: IReport,
    item: IReportItem;
}
const valueMap: { [key: string]: { [key2: string]: string } } = {
    "VIOLATION": {
        "POTENTIAL": "Needs review",
        "FAIL": "Violation",
        "PASS": "Pass",
        "MANUAL": "Recommendation"
    },
    "RECOMMENDATION": {
        "POTENTIAL": "Recommendation",
        "FAIL": "Recommendation",
        "PASS": "Pass",
        "MANUAL": "Recommendation"
    }
};
export default class HelpFile extends React.Component<IHelpFileProps> {
    ItemActive = () => {
        return <span>{this.props.item.message}</span>
    }

    ItemPassive = () => {
        return <span>{this.props.report.nls[this.props.item.ruleId][0]}</span>
    }

    ItemLevel = () => {
        const value = this.props.item.value;
        const val = valueMap[value[0]][value[1]] || value[0] + "_" + value[1];
        let icon = <React.Fragment></React.Fragment>;
        if (val === "Violation") icon = <img src={Violation16} alt="" />;
        if (val === "Needs review") icon = <img src={NeedsReview16} alt="" />;
        if (val === "Recommendation") icon = <img src={Recommendation16} alt="" />;
        return <div className="issueLevel">{icon}{val}</div>
    }

    ItemSnippet = () => {
        return <React.Fragment>
            <h2 id="element-location">Element location</h2>
            <div style={{margin: "1rem 0rem"}}>
                <CodeSnippet type="single" light={true} >
                    {this.props.item.snippet}
                </CodeSnippet>
            </div>
        </React.Fragment>
    }
    render() : ReactNode {
        const md = \``;
const componentFooter = `\`;
 
return(
    <Markdown
        children={md}
        options={{
            overrides: {
                Row: {
                    component: Row,
                },
                Column: {
                    component: Column,
                },
                ul: {
                    component: UnorderedList
                },
                ol: {
                    component: OrderedList
                },
                li: {
                    component: ListItem
                },
                ItemActive: {
                    component: this.ItemActive
                },
                ItemPassive: {
                    component: this.ItemPassive
                },
                ItemLevel: {
                    component: this.ItemLevel
                },
                ItemSnippet: {
                    component: this.ItemSnippet
                }
            }
        }}
    />);
}
}`;
function copyFiles() {
    return gulp.src(["../../accessibility-checker-engine/help/*.mdx"])
        .pipe(ext_replace('.tsx'))
        .pipe(replace(/`/g, "\\`"))
        .pipe(replace("export default ({ children, _frontmatter }) => (<React.Fragment>{children}</React.Fragment>)", ""))
        .pipe(replace("export default ({ children }) => (<React.Fragment>{children}</React.Fragment>)", ""))
        .pipe(replace("<div id=\"locSnippet\"></div>", "<ItemSnippet item={this.props.item} />"))
        .pipe(replace("<div id=\"locLevel\"></div>", "<ItemLevel item={this.props.item} />"))
        .pipe(replace(/(## (.|\n)*?## (.|\n)*?## ).*?\n(.|\n)*?\n\n/, "$1<ItemActive item={this.props.item} />\n<ItemPassive item={this.props.item} />\n\n"))
        .pipe(replace(/^[^<]*/, componentHeader))
        .pipe(replace(/$/, componentFooter))
        .pipe(gulp.dest("../src/ts/help/"));
}

function fileSwitcher() {
    let files = fs.readdirSync("../../accessibility-checker-engine/help/")
    let imports = "";
    let usage = "";
    for (const fileName of files) {
        let component = fileName.replace(".mdx", "");
        imports += `import ${component} from "./${component}";\n`;
        usage += `{this.props.item.ruleId === '${component}' && <${component} report={this.props.report} item={this.props.item} />}\n`;
    }
    return gulp.src("./helpSwitcher.template")
    .pipe(ext_replace('.tsx'))
    .pipe(replace("../src/ts/", "../"))
    .pipe(replace(/\/\/ REPLACE_IMPORTS/, imports))   
    .pipe(replace(/\{\/\* REPLACE_FILES \*\/}/, usage))   
    .pipe(gulp.dest("../src/ts/help/"));
}
const build = gulp.series(copyFiles, fileSwitcher);

exports.default= build;