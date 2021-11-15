const fs = require("fs");
const gulp = require('gulp');
var replace = require('gulp-replace');
var ext_replace = require('gulp-ext-replace');

const componentHeader = `import React, { ReactNode } from "react";
import Markdown from 'markdown-to-jsx';
import { IReportItem, IReport } from '../IReport';
import {
    OrderedList, UnorderedList, ListItem, CodeSnippet
} from 'carbon-components-react';

const Violation16 = <svg version="1.1" id="icon" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 16 16">
<rect id="_Transparent_Rectangle_" style={{fill: "none"}} width="16" height="16"/>
<path style={{fill: "#A2191F"}} d="M8,1C4.1,1,1,4.1,1,8s3.1,7,7,7s7-3.1,7-7S11.9,1,8,1z M10.7,11.5L4.5,5.3l0.8-0.8l6.2,6.2L10.7,11.5z"/>
<path id="inner-path" style={{fill: "#FFFFFF", fillOpacity: 0}} d="M10.7,11.5L4.5,5.3l0.8-0.8l6.2,6.2L10.7,11.5z"/>
</svg>

const NeedsReview16 = <svg version="1.1" id="icon" x="0px" y="0px"
	 width="16px" height="16px" viewBox="0 0 16 16">
<rect id="_Transparent_Rectangle_" style={{fill: "none"}} width="16" height="16"/>
<path style={{fill: "#F1C21B"}} d="M14.9,13.3l-6.5-12C8.3,1,8,0.9,7.8,1.1c-0.1,0-0.2,0.1-0.2,0.2l-6.5,12c-0.1,0.1-0.1,0.3,0,0.5
	C1.2,13.9,1.3,14,1.5,14h13c0.2,0,0.3-0.1,0.4-0.2C15,13.6,15,13.4,14.9,13.3z M7.4,4h1.1v5H7.4V4z M8,11.8c-0.4,0-0.8-0.4-0.8-0.8
	s0.4-0.8,0.8-0.8c0.4,0,0.8,0.4,0.8,0.8S8.4,11.8,8,11.8z"/>
<g>
	<g>
		<g>
			<rect x="7.45" y="4" width="1.1" height="5"/>
		</g>
	</g>
	<g>
		<g>
			<circle cx="8" cy="11" r="0.8"/>
		</g>
	</g>
</g>
</svg>

const Recommendation16 = <svg version="1.1" id="icon" x="0px" y="0px"
	 width="16px" height="16px" viewBox="0 0 16 16">
<rect id="_Transparent_Rectangle_" style={{fill: "none"}} width="16" height="16"/>
<path style={{fill: "#0043CE"}} d="M14,15H2c-0.6,0-1-0.4-1-1V2c0-0.6,0.4-1,1-1h12c0.6,0,1,0.4,1,1v12C15,14.6,14.6,15,14,15z"/>
<text transform="matrix(1 0 0 1 5.9528 12.5044)" style={{fill: "#FFFFFF", fontFamily: "IBMPlexSerif", fontSize: "12.9996px"}}>i</text>
</svg>

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
        if (val === "Violation") icon = Violation16;
        if (val === "Needs review") icon = NeedsReview16;
        if (val === "Recommendation") icon = Recommendation16;
        return <div className="issueLevel">{icon}{val}</div>
    }

    MyCodeSnippet = ({children, ...rest}: { children: any}) => {
        
        var snippet = '';

        if(children.length > 1){
            children.forEach((element:any) => {
                if(element.props){
                    snippet = snippet + element.props.children[0] + '\\n'
                } else {
                    snippet = snippet + element + '\\n'
                }
            });
        } else if (children.length === 1){
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

    handleCodeCopy = (codeString: string) => {
        navigator.clipboard.writeText(codeString).then(() => {
          // Success!
        })
        .catch((err) => {
          console.log("handleCodeCopy error:", err);
        });
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
        .pipe(gulp.dest("../src/help/"));
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
    .pipe(replace("../src/IReport", "../IReport"))
    .pipe(replace(/\/\/ REPLACE_IMPORTS/, imports))   
    .pipe(replace(/\{\/\* REPLACE_FILES \*\/}/, usage))   
    .pipe(gulp.dest("../src/help/"));
}
const build = gulp.series(copyFiles, fileSwitcher);

exports.default= build;