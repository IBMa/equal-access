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
            emit(EVENTS.RESULT, { report });
        },
        [STORY_CHANGED]: () => {
            emit(EVENTS.RESULT, {
                report: null
            });
        },
        [EVENTS.CLEAR]: () => {
            emit(EVENTS.RESULT, {
                report: null
            });
        },
    });

    return storyFn();
};
