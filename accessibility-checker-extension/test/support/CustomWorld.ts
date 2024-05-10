import {World, IWorldOptions, ITestCaseHookParameter } from '@cucumber/cucumber';
import { BrowserWrapper } from './BrowserWrapper';
import { randomUUID } from "crypto";
// const guuid = randomUUID();

export class CustomWorld extends World {
    readonly browser: BrowserWrapper;
    scenario?: ITestCaseHookParameter;
    scenarioData: { [key: string]: string } = {};
    uuid = randomUUID();

    constructor(options: IWorldOptions) {
        super(options);
        this.browser = BrowserWrapper.get();
    }

    async init(): Promise<void> {
        // await this.browser.newContext();
    }

    async destroy(): Promise<void> {
        // See steps_generic After. If the scenario fails, we won't close the context for this scenario
    }
}