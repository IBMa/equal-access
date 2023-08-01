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

            // PASSES
            let passes = report && report.results.filter((result: any) => {
                return result.message === "Rule Passed";
            }) || [];
            var passesData = {
                "passesMsgs": [] as any
            };
            var passesMsgs = [] as any;
            for (let i = 0; i < passes.length; i++) {
                // console.log("[",i,"] = ", passes[i].message);
                passesMsgs.push({ title: passes[i].message, description: "Test description" });
            }
            let myPasses = {"passes": passesMsgs};

            // VIOLATIONS
            let violations = report && report.results.filter((result: any) => {
                return result.value[0] === "VIOLATION" && result.value[1] === "FAIL";
            }) || [];
            var violationsData = {
                "violationMsgs": [] as any
            };
            var violationMsgs = [] as any;
            for (let i = 0; i < violations.length; i++) {
                // console.log("[",i,"] = ", violations[i].message);
                violationMsgs.push({ title: violations[i].message, description: "Test description" });
            }
            let myViolations = {"violations": violationMsgs};

            // NEEDS REVIEW
            let needsReview = report && report.results.filter((result: any) => {
                return result.value[0] === "VIOLATION" && (result.value[1] === "POTENTIAL" || result.value[1] === "MANUAL");
            }) || [];
            var needsReviewData = {
                "needsReviewMsgs": [] as any
            };
            var needsReviewMsgs = [] as any;
            console.log("needsReview.length = ", needsReview.length);
            for (let i = 0; i < needsReview.length; i++) {
                // console.log("[",i,"] = ", needsReview[i].message);
                needsReviewMsgs.push({ title: needsReview[i].message, description: "Test description" });
            }
            let myNeedsreview = {"needsReview": needsReviewMsgs};
            
            emit(EVENTS.RESULT, {
                passes: myPasses.passes,
                violations: myViolations.violations,
                needsReview: myNeedsreview.needsReview,
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
