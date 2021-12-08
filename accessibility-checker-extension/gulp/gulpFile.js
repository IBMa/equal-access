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
        "MANUAL": "Needs review"
    },
    "RECOMMENDATION": {
        "POTENTIAL": "Recommendation",
        "FAIL": "Recommendation",
        "PASS": "Pass",
        "MANUAL": "Recommendation"
    },
    "INFORMATION": {
        "POTENTIAL": "Needs review",
        "FAIL": "Violation",
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

    handleCodeCopy = (codeString: string) => {
        const element = document.createElement("textarea");
        element.value = codeString;
        document.body.appendChild(element);
        element.select();
        document.execCommand("copy");
        document.body.removeChild(element);
      };

    ItemSnippet = () => {
        return <React.Fragment>
            <h3 id="element-location">Element location</h3>
            <div style={{margin: "1rem 0rem"}}>
                <CodeSnippet type="single" light={true} onClick={() => this.handleCodeCopy(this.props.item.snippet)}>
                    {this.props.item.snippet}
                </CodeSnippet>
            </div>
        </React.Fragment>
    }

    MyCodeSnippet = ({children, ...rest}: { children: any}) => {
        
        var snippet = '';

        if (children.length > 1){
            children.forEach((element:any) => {
                if(element.props){
                    snippet = snippet + element.props.children[0] + '\\n'
                } else {
                    snippet = snippet + element + '\\n'
                }
            });
        } else if (children.length === 1) {
            snippet = children[0];
        }

        return <div style={{margin: "1rem 0rem"}}>
            <CodeSnippet {...rest} onClick={() => this.handleCodeCopy(snippet)}>
                {children}
            </CodeSnippet>
        </div>
    }

    MyLink = ({children, title, href, ...rest}: { children: any, title: string, href: string}) => {
        return <a href={href} style={{color:"#000000"}} target="_blank" rel="noopener noreferrer" title={title} {...rest}>{children}</a>
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
                a: {
                    component: this.MyLink
                },
                CodeSnippet: {
                    component: this.MyCodeSnippet
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
        .pipe(replace(/className=\"toolHead\">(.|\n)*?\<\/Column\>/,`className="toolHead">

<h3><ItemActive item={this.props.item} /></h3>

<div id="locLevel"></div>

<p><ItemPassive item={this.props.item} /></p>

</Column>`))
        .pipe(replace("<div id=\"locSnippet\"></div>", "<ItemSnippet item={this.props.item} />"))
        .pipe(replace("<div id=\"locLevel\"></div>", "<ItemLevel item={this.props.item} />"))
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
        let reactName = component.substring(0,1).toUpperCase()+component.substring(1);
        
        imports += `import ${reactName} from "./${component}";\n`;
        usage += `{this.props.item.ruleId === '${component}' && <${reactName} report={this.props.report} item={this.props.item} />}\n`;
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