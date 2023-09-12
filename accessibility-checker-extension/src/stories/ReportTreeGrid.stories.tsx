import type { Meta, StoryObj } from '@storybook/react';
import { ReportTreeGrid } from '../ts/devtools/components/reportTreeGrid';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
    title: 'Extension/ReportTreeGrid',
    component: ReportTreeGrid,
    parameters: {
        // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
        // layout: 'centered',
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
    tags: ['autodocs'],
    render: ({ ...args }) => (
        <main>
            <a href="#">Link before</a>
            <div style={{ marginTop: "1rem" }} />
            <ReportTreeGrid {...args} />
            <div style={{ marginTop: "1rem" }} />
            <a href="#">Link after</a></main>
    )
} satisfies Meta<typeof ReportTreeGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const NoScan: Story = {
    args: {
        unfilteredCount: 20,
        panel: "elements", // "main"
        noScanMessage: "No scan message",
        headers: [
            { key: "issueCount", label: "Issues" },
            { key: "label", label: "Element Roles" }
        ],
        rowData: null,
        selectedPath: "",
        onResetFilters: () => { }
    },
};


export const EmptyScan: Story = {
    args: {
        className: "myCssClassName",
        unfilteredCount: 20,
        panel: "elements", // "main"
        noScanMessage: "No scan message",
        headers: [
            { key: "issueCount", label: "Issues" },
            { key: "label", label: "Element Roles" }
        ],
        rowData: [],
        selectedPath: "",
        onResetFilters: () => { }
    },
};

export const ExampleScan: Story = {
    args: {
        className: "myCssClassName",
        unfilteredCount: 20,
        panel: "elements", // "main"
        noScanMessage: "No scan message",
        headers: [
            { key: "issueCount", label: "Issues" },
            { key: "label", label: "Element Roles" }
        ],
        rowData: [
            {
                id: ReportTreeGrid.cleanId("/document[1]"),
                label: "/document[1]",
                children: [
                    {
                        "ruleId": "html_lang_exists",
                        "value": [
                            "VIOLATION",
                            "FAIL"
                        ],
                        "path": {
                            "dom": "/html[1]",
                            "aria": "/document[1]"
                        },
                        "ruleTime": 0,
                        "reasonId": "Fail_3",
                        "message": "Page detected as HTML, but does not have a 'lang' attribute",
                        "messageArgs": [],
                        "apiArgs": [],
                        "bounds": {
                            "left": 0,
                            "top": 0,
                            "height": 2930,
                            "width": 3060
                        },
                        "snippet": "<html>",
                        "category": "Accessibility",
                        "help": ""
                    },
                    {
                        "ruleId": "skip_main_exists",
                        "value": [
                            "VIOLATION",
                            "FAIL"
                        ],
                        "path": {
                            "dom": "/html[1]/body[1]",
                            "aria": "/document[1]"
                        },
                        "ruleTime": 0,
                        "reasonId": "Fail_1",
                        "message": "The page does not provide a way to quickly navigate to the main content (ARIA \"main\" landmark or a skip link)",
                        "messageArgs": [],
                        "apiArgs": [],
                        "bounds": {
                            "left": 16,
                            "top": 16,
                            "height": 2898,
                            "width": 3028
                        },
                        "snippet": "<body text=\"#000000\" bgcolor=\"#CCCC99\" class=\"main\">",
                        "category": "Accessibility",
                        "help": ""
                    },
                    {
                        "ruleId": "html_skipnav_exists",
                        "value": [
                            "VIOLATION",
                            "POTENTIAL"
                        ],
                        "path": {
                            "dom": "/html[1]",
                            "aria": "/document[1]"
                        },
                        "ruleTime": 0,
                        "reasonId": "Potential_1",
                        "message": "Verify there is a way to bypass blocks of content that are repeated on multiple Web pages",
                        "messageArgs": [],
                        "apiArgs": [],
                        "bounds": {
                            "left": 0,
                            "top": 0,
                            "height": 2930,
                            "width": 3060
                        },
                        "snippet": "<html>",
                        "category": "Accessibility",
                        "help": ""
                    },
                    {
                        "ruleId": "style_color_misuse",
                        "value": [
                            "VIOLATION",
                            "POTENTIAL"
                        ],
                        "path": {
                            "dom": "/html[1]/head[1]/link[1]",
                            "aria": "/document[1]"
                        },
                        "ruleTime": 0,
                        "reasonId": "Potential_1",
                        "message": "Verify color is not used as the only visual means of conveying information",
                        "messageArgs": [],
                        "apiArgs": [],
                        "bounds": {
                            "left": 0,
                            "top": 0,
                            "height": 0,
                            "width": 0
                        },
                        "snippet": "<link type=\"text/css\" href=\"main.css\" rel=\"stylesheet\">",
                        "category": "Accessibility",
                        "help": ""
                    },
                    {
                        "ruleId": "style_highcontrast_visible",
                        "value": [
                            "VIOLATION",
                            "MANUAL"
                        ],
                        "path": {
                            "dom": "/html[1]/head[1]/link[1]",
                            "aria": "/document[1]"
                        },
                        "ruleTime": 0,
                        "reasonId": "Manual_1",
                        "message": "Confirm Windows high contrast mode is supported when using CSS to include, position or alter non-decorative content",
                        "messageArgs": [],
                        "apiArgs": [],
                        "bounds": {
                            "left": 0,
                            "top": 0,
                            "height": 0,
                            "width": 0
                        },
                        "snippet": "<link type=\"text/css\" href=\"main.css\" rel=\"stylesheet\">",
                        "category": "Accessibility",
                        "help": ""
                    },
                    {
                        "ruleId": "element_attribute_deprecated",
                        "value": [
                            "RECOMMENDATION",
                            "FAIL"
                        ],
                        "path": {
                            "dom": "/html[1]/head[1]/meta[1]",
                            "aria": "/document[1]"
                        },
                        "ruleTime": 0,
                        "reasonId": "fail_elem_attr",
                        "message": "The HTML attribute(s) \"http-equiv\" is deprecated for the <meta> element in HTML 5",
                        "messageArgs": [
                            "http-equiv",
                            "meta"
                        ],
                        "apiArgs": [],
                        "bounds": {
                            "left": 0,
                            "top": 0,
                            "height": 0,
                            "width": 0
                        },
                        "snippet": "<meta content=\"text/html; charset=iso-8859-1\" http-equiv=\"Content-Type\">",
                        "category": "Accessibility",
                        "help": ""
                    },
                    {
                        "ruleId": "element_attribute_deprecated",
                        "value": [
                            "RECOMMENDATION",
                            "FAIL"
                        ],
                        "path": {
                            "dom": "/html[1]/body[1]",
                            "aria": "/document[1]"
                        },
                        "ruleTime": 0,
                        "reasonId": "fail_attr",
                        "message": "The HTML attribute(s) \"bgcolor, text\" is deprecated in HTML 5",
                        "messageArgs": [
                            "bgcolor, text"
                        ],
                        "apiArgs": [],
                        "bounds": {
                            "left": 16,
                            "top": 16,
                            "height": 2898,
                            "width": 3028
                        },
                        "snippet": "<body text=\"#000000\" bgcolor=\"#CCCC99\" class=\"main\">",
                        "category": "Accessibility",
                        "help": ""
                    },
                    {
                        "ruleId": "element_attribute_deprecated",
                        "value": [
                            "RECOMMENDATION",
                            "FAIL"
                        ],
                        "path": {
                            "dom": "/html[1]/body[1]/div[1]",
                            "aria": "/document[1]"
                        },
                        "ruleTime": 0,
                        "reasonId": "fail_attr",
                        "message": "The HTML attribute(s) \"align\" is deprecated in HTML 5",
                        "messageArgs": [
                            "align"
                        ],
                        "apiArgs": [],
                        "bounds": {
                            "left": 16,
                            "top": 16,
                            "height": 491,
                            "width": 3028
                        },
                        "snippet": "<div align=\"center\">",
                        "category": "Accessibility",
                        "help": ""
                    },
                    {
                        "ruleId": "element_attribute_deprecated",
                        "value": [
                            "RECOMMENDATION",
                            "FAIL"
                        ],
                        "path": {
                            "dom": "/html[1]/body[1]/div[1]/font[1]",
                            "aria": "/document[1]"
                        },
                        "ruleTime": 0,
                        "reasonId": "fail_elem",
                        "message": "The <font> element is deprecated in HTML 5",
                        "messageArgs": [
                            "font"
                        ],
                        "apiArgs": [],
                        "bounds": {
                            "left": 1284,
                            "top": 484,
                            "height": 22,
                            "width": 493
                        },
                        "snippet": "<font face=\"Arial, Helvetica, sans-serif\" size=\"1\">",
                        "category": "Accessibility",
                        "help": ""
                    }
                ]
            },
            {
                id: ReportTreeGrid.cleanId("/document[1]/table[1]"),
                label: "/document[1]/table[1]",
                children: [
                    {
                        "ruleId": "aria_content_in_landmark",
                        "value": [
                            "VIOLATION",
                            "FAIL"
                        ],
                        "node": {
                            "RPTUtil_isComplexDataTable": false
                        },
                        "path": {
                            "dom": "/html[1]/body[1]/div[1]/table[1]",
                            "aria": "/document[1]/table[1]"
                        },
                        "ruleTime": 0,
                        "reasonId": "Fail_1",
                        "message": "Content is not within a landmark element",
                        "messageArgs": [],
                        "apiArgs": [],
                        "bounds": {
                            "left": 730,
                            "top": 16,
                            "height": 468,
                            "width": 1600
                        },
                        "snippet": "<table cellpadding=\"15\" cellspacing=\"0\" border=\"0\" width=\"800\" class=\"borTable\">",
                        "category": "Accessibility",
                        "help": ""
                    },
                    {
                        "ruleId": "element_attribute_deprecated",
                        "value": [
                            "RECOMMENDATION",
                            "FAIL"
                        ],
                        "node": {
                            "RPTUtil_isComplexDataTable": false
                        },
                        "path": {
                            "dom": "/html[1]/body[1]/div[1]/table[1]",
                            "aria": "/document[1]/table[1]"
                        },
                        "ruleTime": 0,
                        "reasonId": "fail_elem_attr",
                        "message": "The HTML attribute(s) \"width, cellspacing, cellpadding\" is deprecated for the <table> element in HTML 5",
                        "messageArgs": [
                            "width, cellspacing, cellpadding",
                            "table"
                        ],
                        "apiArgs": [],
                        "bounds": {
                            "left": 730,
                            "top": 16,
                            "height": 468,
                            "width": 1600
                        },
                        "snippet": "<table cellpadding=\"15\" cellspacing=\"0\" border=\"0\" width=\"800\" class=\"borTable\">",
                        "category": "Accessibility",
                        "help": ""
                    },
                    {
                        "ruleId": "aria_accessiblename_exists",
                        "value": [
                            "RECOMMENDATION",
                            "FAIL"
                        ],
                        "node": {
                            "RPTUtil_isComplexDataTable": false
                        },
                        "path": {
                            "dom": "/html[1]/body[1]/div[1]/table[1]",
                            "aria": "/document[1]/table[1]"
                        },
                        "ruleTime": 0,
                        "reasonId": "fail_no_accessible_name",
                        "message": "Element <table> with \"table\" role has no accessible name",
                        "messageArgs": [
                            "table",
                            "table"
                        ],
                        "apiArgs": [],
                        "bounds": {
                            "left": 730,
                            "top": 16,
                            "height": 468,
                            "width": 1600
                        },
                        "snippet": "<table ariapath=\"/document[1]/table[1]\" dompath=\"/html[1]/body[1]/div[1]/table[1]\" cellpadding=\"15\" cellspacing=\"0\" border=\"0\" width=\"800\" class=\"borTable\">",
                        "category": "Accessibility",
                        "help": ""
                    }
                ]
            },
            {
                id: ReportTreeGrid.cleanId("/document[1]/table[1]/rowgroup[1]/row[1]/cell[1]"),
                label: "/document[1]/table[1]/rowgroup[1]/row[1]/cell[1]",
                children: [
                    {
                        "ruleId": "element_attribute_deprecated",
                        "value": [
                            "RECOMMENDATION",
                            "FAIL"
                        ],
                        "path": {
                            "dom": "/html[1]/body[1]/div[1]/table[1]/tbody[1]/tr[1]/td[1]",
                            "aria": "/document[1]/table[1]/rowgroup[1]/row[1]/cell[1]"
                        },
                        "ruleTime": 0,
                        "reasonId": "fail_attr",
                        "message": "The HTML attribute(s) \"bgcolor\" is deprecated in HTML 5",
                        "messageArgs": [
                            "bgcolor"
                        ],
                        "apiArgs": [],
                        "bounds": {
                            "left": 732,
                            "top": 18,
                            "height": 464,
                            "width": 1596
                        },
                        "snippet": "<td bgcolor=\"#ffffff\">",
                        "category": "Accessibility",
                        "help": ""
                    }
                ]
            },
            {
                id: ReportTreeGrid.cleanId("/document[1]/table[1]/rowgroup[1]/row[1]/cell[1]/paragraph[1]"),
                label: "/document[1]/table[1]/rowgroup[1]/row[1]/cell[1]/paragraph[1]",
                children: [
                    {
                        "ruleId": "element_attribute_deprecated",
                        "value": [
                            "RECOMMENDATION",
                            "FAIL"
                        ],
                        "path": {
                            "dom": "/html[1]/body[1]/div[1]/table[1]/tbody[1]/tr[1]/td[1]/p[1]",
                            "aria": "/document[1]/table[1]/rowgroup[1]/row[1]/cell[1]/paragraph[1]"
                        },
                        "ruleTime": 0,
                        "reasonId": "fail_attr",
                        "message": "The HTML attribute(s) \"align\" is deprecated in HTML 5",
                        "messageArgs": [
                            "align"
                        ],
                        "apiArgs": [],
                        "bounds": {
                            "left": 762,
                            "top": 48,
                            "height": 0,
                            "width": 1536
                        },
                        "snippet": "<p align=\"left\" class=\"heading\">",
                        "category": "Accessibility",
                        "help": ""
                    }
                ]
            },
            {
                id: ReportTreeGrid.cleanId("/document[1]/table[1]/rowgroup[1]/row[1]/cell[1]/paragraph[1]/img[1]"),
                label: "/document[1]/table[1]/rowgroup[1]/row[1]/cell[1]/paragraph[1]/img[1]",
                children: [
                    {
                        "ruleId": "element_attribute_deprecated",
                        "value": [
                            "RECOMMENDATION",
                            "FAIL"
                        ],
                        "path": {
                            "dom": "/html[1]/body[1]/div[1]/table[1]/tbody[1]/tr[1]/td[1]/p[1]/img[1]",
                            "aria": "/document[1]/table[1]/rowgroup[1]/row[1]/cell[1]/paragraph[1]/img[1]"
                        },
                        "ruleTime": 0,
                        "reasonId": "fail_attr",
                        "message": "The HTML attribute(s) \"align\" is deprecated in HTML 5",
                        "messageArgs": [
                            "align"
                        ],
                        "apiArgs": [],
                        "bounds": {
                            "left": 1894,
                            "top": 48,
                            "height": 404,
                            "width": 404
                        },
                        "snippet": "<img align=\"right\" width=\"200\" border=\"1\" src=\"http://\">",
                        "category": "Accessibility",
                        "help": ""
                    },
                    {
                        "ruleId": "img_alt_valid",
                        "value": [
                            "VIOLATION",
                            "FAIL"
                        ],
                        "path": {
                            "dom": "/html[1]/body[1]/div[1]/table[1]/tbody[1]/tr[1]/td[1]/p[1]/img[1]",
                            "aria": "/document[1]/table[1]/rowgroup[1]/row[1]/cell[1]/paragraph[1]/img[1]"
                        },
                        "ruleTime": 1,
                        "reasonId": "fail_no_alt",
                        "message": "The image has neither an alt atttribute nor an ARIA label or title",
                        "messageArgs": [],
                        "apiArgs": [],
                        "bounds": {
                            "left": 1894,
                            "top": 48,
                            "height": 404,
                            "width": 404
                        },
                        "snippet": "<img align=\"right\" width=\"200\" border=\"1\" src=\"http://\">",
                        "category": "Accessibility",
                        "help": ""
                    }
                ]
            },
            {
                id: ReportTreeGrid.cleanId("/document[1]/table[1]/rowgroup[1]/row[1]/cell[1]/paragraph[2]"),
                label: "/document[1]/table[1]/rowgroup[1]/row[1]/cell[1]/paragraph[2]",
                children: [
                    {
                        "ruleId": "element_attribute_deprecated",
                        "value": [
                            "RECOMMENDATION",
                            "FAIL"
                        ],
                        "path": {
                            "dom": "/html[1]/body[1]/div[1]/table[1]/tbody[1]/tr[1]/td[1]/p[2]",
                            "aria": "/document[1]/table[1]/rowgroup[1]/row[1]/cell[1]/paragraph[2]"
                        },
                        "ruleTime": 0,
                        "reasonId": "fail_attr",
                        "message": "The HTML attribute(s) \"align\" is deprecated in HTML 5",
                        "messageArgs": [
                            "align"
                        ],
                        "apiArgs": [],
                        "bounds": {
                            "left": 762,
                            "top": 48,
                            "height": 37,
                            "width": 1536
                        },
                        "snippet": "<p align=\"left\" class=\"heading\">",
                        "category": "Accessibility",
                        "help": ""
                    }
                ]
            },
            {
                id: ReportTreeGrid.cleanId("/document[1]/table[1]/rowgroup[1]/row[1]/cell[1]/paragraph[3]"),
                label: "/document[1]/table[1]/rowgroup[1]/row[1]/cell[1]/paragraph[3]",
                children: [
                    {
                        "ruleId": "element_attribute_deprecated",
                        "value": [
                            "RECOMMENDATION",
                            "FAIL"
                        ],
                        "path": {
                            "dom": "/html[1]/body[1]/div[1]/table[1]/tbody[1]/tr[1]/td[1]/p[3]",
                            "aria": "/document[1]/table[1]/rowgroup[1]/row[1]/cell[1]/paragraph[3]"
                        },
                        "ruleTime": 0,
                        "reasonId": "fail_attr",
                        "message": "The HTML attribute(s) \"align\" is deprecated in HTML 5",
                        "messageArgs": [
                            "align"
                        ],
                        "apiArgs": [],
                        "bounds": {
                            "left": 762,
                            "top": 117,
                            "height": 37,
                            "width": 1536
                        },
                        "snippet": "<p align=\"left\">",
                        "category": "Accessibility",
                        "help": ""
                    }
                ]
            },
            {
                id: ReportTreeGrid.cleanId("/document[1]/table[1]/rowgroup[1]/row[1]/cell[1]/paragraph[4]"),
                label: "/document[1]/table[1]/rowgroup[1]/row[1]/cell[1]/paragraph[4]",
                children: [
                    {
                        "ruleId": "element_attribute_deprecated",
                        "value": [
                            "RECOMMENDATION",
                            "FAIL"
                        ],
                        "path": {
                            "dom": "/html[1]/body[1]/div[1]/table[1]/tbody[1]/tr[1]/td[1]/p[4]",
                            "aria": "/document[1]/table[1]/rowgroup[1]/row[1]/cell[1]/paragraph[4]"
                        },
                        "ruleTime": 0,
                        "reasonId": "fail_attr",
                        "message": "The HTML attribute(s) \"align\" is deprecated in HTML 5",
                        "messageArgs": [
                            "align"
                        ],
                        "apiArgs": [],
                        "bounds": {
                            "left": 762,
                            "top": 186,
                            "height": 37,
                            "width": 1536
                        },
                        "snippet": "<p align=\"left\" class=\"heading\">",
                        "category": "Accessibility",
                        "help": ""
                    }
                ]
            }
        ],
        selectedPath: "/html[1]",
        onResetFilters: () => { }
    },
};


