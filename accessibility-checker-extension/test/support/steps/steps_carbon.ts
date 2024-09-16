import {When, Then, Given} from '@cucumber/cucumber';
import {CustomWorld} from '../CustomWorld';
import { CarbonUtil } from '../util/carbon';

Given('a condition is met', async () => {
    // Implement the step here
});

///////////////////////////////////////////////////////////////////////////////
// UIShell
////
Then(`header name is {string}`, async function(txt: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.UIShell.header_name_equals(page, txt);
})

///////////////////////////////////////////////////////////////////////////////
// Button
////

When(`user activates Button {string}`, async function(txt: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.Button.activate(page, txt);
})

Then(`Button {string} exists`, async function(txt: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.Button.exists(page, txt);
})

Then(`Button {string} is disabled`, async function(txt: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.Button.isDisabled(page, txt);
})

Then(`Button {string} is enabled`, async function(txt: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.Button.isEnabled(page, txt);
})

///////////////////////////////////////////////////////////////////////////////
// DataTable Button
////
When(`user activates Button {string} in DataTable when column {int} is {string}`, async function(butLabel: string, col: number, txt: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.DataTable.activateRowButton(page, butLabel, col, txt, true);
})

When(`user activates Link {string} in DataTable when column {int} is {string}`, async function(butLabel: string, col: number, txt: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.DataTable.activateRowLink(page, butLabel, col, txt, true);
})

When(`user activates Link {string} in DataTable when column {int} is {string}, skipping search`, async function(butLabel: string, col: number, txt: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.DataTable.activateRowLink(page, butLabel, col, txt, false);
})

When(`user activates Checkbox in DataTable when column {int} is {string}`, async function(col: number, txt: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.DataTable.activateRowCheckbox(page, col, txt, true);
})

///////////////////////////////////////////////////////////////////////////////
// Dropdown
////

When(`user activates Dropdown {string} {string}`, async function(label: string, txt: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.Dropdown.activate(page, label, txt);
})

Then(`Dropdown {string} is enabled`, async function (dropdownLabel: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.Dropdown.isEnabled(page, dropdownLabel);
})

///////////////////////////////////////////////////////////////////////////////
// Link
////

When(`user activates Link {string}`, async function(txt: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.Link.activate(page, txt);
})

Then(`Link {string} exists`, async function(txt: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.Link.exists(page, txt);
})


///////////////////////////////////////////////////////////////////////////////
// Menu
////

// When(`user activates Menu {string} {string}`, async function(label: string, txt: string) {
//     const page = (this as CustomWorld).browser.page();
//     await CarbonUtil.Menu.activate(page, label, txt);
// })

When('user activates Menu Button {string}', async function (label: string) {
    const page = (this as CustomWorld).browser.page();  // Access Puppeteer page from CustomWorld

    // Use correct selector for Carbon component's Options button (SVG element)
    const selector = `svg[aria-label="${label}"]`;  // Match SVG by aria-label
    await page.waitForSelector(selector, { timeout: 60000 });  // Wait for the button with "options" label
    await page.click(selector);    
})

// Step definition to check if the menu item exists
Then('carbon elem {string} is visible', async function (txt: string) {
    const page = (this as CustomWorld).browser.page();

    // Wait for the specific menu option to appear with the text
    await page.waitForXPath(`//div[contains(@class, 'cds--overflow-menu-options__option-content') and text()='${txt}']`, { visible: true, timeout: 60000 });
})


Then('carbon elem {string} is disabled', async function (txt: string) {
    const page = (this as CustomWorld).browser.page();

    // Use XPath to find the button by its associated div text
    const [button] = await page.$x(`//button[contains(@class, 'cds--overflow-menu-options__btn') and .//div[text()='${txt}']]`);

    if (!button) {
        throw new Error(`Button with text "${txt}" not found`);
    }

    // Check if the button is disabled by casting to HTMLButtonElement
    const isDisabled = await page.evaluate((btn) => {
        return (btn as HTMLButtonElement).hasAttribute('disabled');
    }, button);

    if (!isDisabled) {
        throw new Error(`Button with text "${txt}" is not disabled`);
    }
})

// Then(`elem {string} is visible`, async function (selector: string) {
//     const page = (this as CustomWorld).browser.page();  // Retrieve the browser page from CustomWorld
//     const isVisible = await page.$eval(selector, (elem) => {
//         return window.getComputedStyle(elem).display !== 'none';  // Check if the element is visible
//     });

//     if (!isVisible) {
//         throw new Error(`Element ${selector} is not visible`);
//     }
// })



///////////////////////////////////////////////////////////////////////////////
// Modal
////

Then (`Modal title is {string}`, async function(txt: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.Modal.exists_title(page, txt);
})

///////////////////////////////////////////////////////////////////////////////
// Notification
////
Then (`Notification {string} exists`, async function (txt: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.Notification.exists_title(page, txt);

})
///////////////////////////////////////////////////////////////////////////////
// Radio
////

When (`user selects Radio {string} {string}`, async function(label: string, value: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.Radio.select(page, label, value);
});

Then (`Radio {string} has value {string}`, async function(label: string, value: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.Radio.value_exists(page, label, value);
});

Then (`Radio {string} has enabled option {string}`, async function(label: string, value: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.Radio.option_enabled(page, label, value);
});

Then (`Radio {string} has disabled option {string}`, async function(label: string, value: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.Radio.option_disabled(page, label, value);
});

///////////////////////////////////////////////////////////////////////////////
// Tab
////
When (`user selects Tab {string}`, async function(label: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.Tab.select(page, label);
});

///////////////////////////////////////////////////////////////////////////////
// TextArea
////
Then(`TextArea {string} exists`, async function(label: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.TextArea.exists(page, label);
})

When(`user types into TextArea {string} {string}`, async function (label: string, txt: string) { 
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.TextArea.type(page, label, txt);
});

///////////////////////////////////////////////////////////////////////////////
// TextInput
////
Then(`TextInput {string} exists`, async function(label: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.TextInput.exists(page, label);
})

When(`user types into TextInput {string} {string}`, async function (label: string, txt: string) { 
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.TextInput.type(page, label, txt);
});

When(`user clears TextInput {string}`, async function (label: string) { 
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.TextInput.clear(page, label);
});

Then(`TextInput {string} value is {string}`, async function (label: string, value: string) {
    const page = (this as CustomWorld).browser.page();
    await CarbonUtil.TextInput.exists_value(page, label, value);
}) 
