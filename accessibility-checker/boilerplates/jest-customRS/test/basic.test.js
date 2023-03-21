"use strict";

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Accordion, AccordionItem } from "@carbon/react";

// Describe this Suite of testscases, describe is a test Suite and 'it' is a testcase.
describe("Hello World Basics", () => {
    beforeAll(() => {
        // JSDom does not implement this and an error was being
        // thrown from jest-axe because of it.
        const { getComputedStyle } = window;
        window.getComputedStyle = (elt) => getComputedStyle(elt);
      });
    test("Image missing alt with Baseline", async () => {
        document.body.innerHTML = "<div><img src='hello.png' /></div>";
        await expect(document).toBeAccessible();
    });
    test("Carbon 11 accordion", async () => {
        const { container } = render(
            <Accordion id="accordion1">
                <AccordionItem
                    id="accordionItem"
                    title={"some title"}
                    label={"some label"}
                >
                    <p>test</p>
                </AccordionItem>
            </Accordion>
        );
        // need to wrap in waitFor(act) since this event causes a state update
        await waitFor(() => userEvent.click(screen.queryByRole("button")));
        await expect(container).toBeAccessible();
    });
});
