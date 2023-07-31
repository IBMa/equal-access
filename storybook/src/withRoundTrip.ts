import { useChannel } from "@storybook/preview-api";
import type {
    Renderer,
    PartialStoryFn as StoryFunction,
} from "@storybook/types";
import { STORY_CHANGED } from "@storybook/core-events";
import { EVENTS } from "./constants";

async function loadEngine() {
    if (!(window as any).ace) {
        await new Promise<void>((resolve, reject) => {
            let scriptUrl = "https://unpkg.com/accessibility-checker-engine@latest/ace.js";
            let script = document.createElement('script');
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('aChecker', 'ACE');
            script.setAttribute('src', scriptUrl);
            script.addEventListener('load', function () {
                resolve();
            });
            script.addEventListener('error', function (evt) {
                reject(new Error(`Unable to load engine into ${document.location.href}. This can happen if the page server sets a Content-Security-Policy that prevents ${scriptUrl} from loading.`))
            });
            let heads = document.getElementsByTagName('head');
            if (heads.length > 0) { heads[0].appendChild(script); }
            else if (document.body) { document.body.appendChild(script); }
            else { Promise.reject("Invalid document"); }
        })
    }
    return new (window as any).ace.Checker();
}

export const withRoundTrip = (storyFn: StoryFunction<Renderer>) => {
    const emit = useChannel({
        [EVENTS.REQUEST]: async () => {
            let checker = await loadEngine()
            let root = document.getElementById("storybook-root");
            let report = await checker.check(root, ["IBM_Accessibility"]);
            // TODO: Run Accessibility Checker here
            console.log(report);
            
            let violations = report && report.results.filter((result: any) => {
                return result.value[0] === "VIOLATION" && result.value[1] === "FAIL";
            }) || [];
            console.log("violations: ", violations);
            console.log("violations.length = ", violations.length);
            var messages:any = [];

            for (let i = 0; i < violations.length; i++) {
                console.log("[",i,"] = ", violations[i].message);
                // let temp = { title: violations[i].message, description: "Test description" };

                messages.add({ title: violations[i].message, description: "Test description" });
            }
            // violations = output;
            // looking for passes: [ {title:violations[i],  } ]
            console.log("messages: ", messages);
            emit(EVENTS.RESULT, {
                passes: [
                    {
                        title: "Hello world! Panels are the most common type of addon in the ecosystem",
                        description:
                            "For example the official @storybook/actions and @storybook/a11y use this pattern",
                    },
                    {
                        title:
                            "You can specify a custom title for your addon panel and have full control over what content it renders",
                        description:
                            "@storybook/components offers components to help you addons with the look and feel of Storybook itself",
                    },
                ],
                violations: [
                    {
                        title: "Hello world! Panels are the most common type of addon in the ecosystem",
                        description:
                            "For example the official @storybook/actions and @storybook/a11y use this pattern",
                    },
                    {
                        title:
                            "You can specify a custom title for your addon panel and have full control over what content it renders",
                        description:
                            "@storybook/components offers components to help you addons with the look and feel of Storybook itself",
                    },
                ],
                needsReview: [
                    {
                        title:
                            'This tabbed UI pattern is a popular option to display "test" reports.',
                        description:
                            "It's used by @storybook/addon-jest and @storybook/addon-a11y. @storybook/components offers this and other components to help you quickly build an addon",
                    },
                ],
            });
        },
        [STORY_CHANGED]: () => {
            emit(EVENTS.RESULT, {
                passes: [],
                violations: [],
                needsReview: [],
            });
        },
        [EVENTS.CLEAR]: () => {
            emit(EVENTS.RESULT, {
                passes: [],
                violations: [],
                needsReview: [],
            });
        },
    });

    return storyFn();
};
