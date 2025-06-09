import { ElementHandle, Page } from "puppeteer";
import { PupUtil } from "./pup";

let UI_MODE: "mouse" | "keyboard" | "touch" = (process.env.UI_MODE || "mouse") as "mouse" | "keyboard" | "touch";

export namespace CarbonUtil {
    export namespace UIShell {
        export async function header_name_equals(page: Page, txt: string) {
            await PupUtil.elemVisible(page, `//header[@aria-label="${txt}"]`)
        }
    }

    export namespace Button {
        export async function activate(page: Page, txt: string) {
            let src : Page | ElementHandle<Node> = page;
            try {
                let modal = await page.waitForSelector(`xpath///div[contains(@class, 'cds--modal')][contains(@class, 'is-visible')]`, { timeout: 10 });
                if (modal) {
                    src = modal;
                }
            } catch (err) {
            }
            let selector = `//button[text()='${txt}']|//button[@aria-label='${txt}']|//span[contains(@class, 'cds--popover-container')][span[@role='tooltip']/span[text()='${txt}']]//button`;
            if (UI_MODE === "mouse") {
                await PupUtil.elemClick(src, selector);
            } else if (UI_MODE === "keyboard") {
                await PupUtil.elemPress(src, selector, "Space");
            } else if (UI_MODE === "touch") {
                await PupUtil.elemTap(src, selector);
            }
        }

        export async function exists(page: Page, txt: string) {
            await PupUtil.elemVisible(page, `//button[text()='${txt}']|//button[@aria-label='${txt}']|//span[contains(@class, 'cds--popover-container')][span[@role='tooltip']/span[text()='${txt}']]//button`);
        }

        export async function isDisabled(page: Page, txt: string) {
            await PupUtil.elemVisible(page, 
                `//button[text()='${txt}'][contains(@class, 'cds--btn--disabled')]|//button[@aria-label='${txt}'][contains(@class, 'cds--btn--disabled')]`)
        }

        export async function isEnabled(page: Page, txt: string) {
            await PupUtil.elemVisible(page, 
                `//button[text()='${txt}'][not(contains(@class, 'cds--btn--disabled'))]|//button[@aria-label='${txt}'][not(contains(@class, 'cds--btn--disabled'))]`)
        }
    }

    export namespace Dropdown {
        export async function activate(scope: Page | ElementHandle<Node>, label: string, value: string) {
            await PupUtil.elemClick(scope, `//div[label[contains(text(), '${label}')]]/label|//button[@role='combobox'][.//*[@class='cds--list-box__label'][.='${label}']]`);
            await PupUtil.elemClick(scope, `//div[label[contains(text(), '${label}')]]//li[.='${value}']|//div[button[@role='combobox'][./span[.='${label}']]]//li[.='${value}']`);
            await PupUtil.elemVisible(scope, `//button[@role='combobox'][@title='${value}']`);
        }
    }

    export namespace Link {
        export async function activate(page: Page, txt: string) {
            await PupUtil.elemClick(page, `//a[@href][.='${txt}']`);
        }

        export async function exists(page: Page, txt: string) {
            await PupUtil.elemVisible(page, `//a[@href][.='${txt}']`);
        }

        export async function exists_not(page: Page, txt: string) {
            await PupUtil.elemNotVisible(page, `//a[@href][.='${txt}']`);
        }
    }

    export namespace Menu {
        export async function activate(page: Page, buttonLabel: string, itemLabel: string) {
            await PupUtil.elemClick(page, `//button[@aria-haspopup='true'][translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='${buttonLabel.toLowerCase()}']|//button[@aria-haspopup='true'][translate(@aria-label,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='${buttonLabel.toLowerCase()}']|//span[contains(@class, 'cds--popover-container')][span[@role='tooltip']/span[translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='${buttonLabel.toLowerCase()}']]//button[@aria-haspopup='true']`)
            await PupUtil.elemClick(page, `//button[@role='menuitem']/div[text()='${itemLabel}']`);
        }

        export async function exists(page: Page, txt: string) {
            await PupUtil.elemVisible(page, `//button[@role='menuitem']/div[text()='${txt}']`);
        }
    }

    export namespace Modal {
        export async function exists_title(page: Page, txt: string) {
            await PupUtil.elemVisible(page, `//h3[contains(@class, 'cds--modal-header__heading')][text()='${txt}']`)
        }
    }

    export namespace Notification {
        export async function exists_title(page: Page, txt: string) {
            await PupUtil.elemVisible(page, `//div[role='status']//div[contains(@class, '__title')][text()='${txt}']`)
        }
    }

    export namespace Radio {
        export async function select(scope: Page | ElementHandle<Node>, label: string, value: string) {
            let labelSelector = label.includes(" ...") ? `starts-with(normalize-space(text()),'${label.replace(/ \.\.\./, "")}')` : `normalize-space(text())='${label}'`;
            let valueSelector = value.includes(" ...") ? `starts-with(normalize-space(text()),'${value.replace(/ \.\.\./, "")}')` : `normalize-space(text())='${value}'`;
            await PupUtil.elemClick(scope, `//fieldset[legend/span[${labelSelector}]]//div[label/span[${valueSelector}]]/label`
                +`|//fieldset[legend[${labelSelector}]]//div[label/span[${valueSelector}]]/label`);
            await Radio.value_exists(scope, label, value);
        }

        export async function value_exists(scope: Page | ElementHandle<Node>, label: string, value: string) {
            let labelSelector = label.includes(" ...") ? `starts-with(normalize-space(text()),'${label.replace(/ \.\.\./, "")}')` : `normalize-space(text())='${label}'`;
            let valueSelector = value.includes(" ...") ? `starts-with(normalize-space(text()),'${value.replace(/ \.\.\./, "")}')` : `normalize-space(text())='${value}'`;
            await PupUtil.elemVisible(scope, `//fieldset[legend/span[${labelSelector}]]//div[label/span[${valueSelector}]]/label`
                +`|//fieldset[legend[${labelSelector}]]//div[label/span[${valueSelector}]]/label`);
        }

        export async function option_disabled(scope: Page | ElementHandle<Node>, label: string, value: string) {
            let labelSelector = label.includes(" ...") ? `starts-with(normalize-space(text()),'${label.replace(/ \.\.\./, "")}')` : `normalize-space(text())='${label}'`;
            let valueSelector = value.includes(" ...") ? `starts-with(normalize-space(text()),'${value.replace(/ \.\.\./, "")}')` : `normalize-space(text())='${value}'`;
            await PupUtil.elemVisible(scope, `//fieldset[legend/span[${labelSelector}]]//div[label/span[${valueSelector}]]//input[@disabled]`
                +`|//fieldset[legend[${labelSelector}]]//div[label/span[${valueSelector}]]//input[@disabled]`);
        }

        export async function option_enabled(scope: Page | ElementHandle<Node>, label: string, value: string) {
            let labelSelector = label.includes(" ...") ? `starts-with(normalize-space(text()),'${label.replace(/ \.\.\./, "")}')` : `normalize-space(text())='${label}'`;
            let valueSelector = value.includes(" ...") ? `starts-with(normalize-space(text()),'${value.replace(/ \.\.\./, "")}')` : `normalize-space(text())='${value}'`;
            await PupUtil.elemVisible(scope, `//fieldset[legend/span[${labelSelector}]]//div[label/span[${valueSelector}]]//input[not(@disabled)]`
                +`|//fieldset[legend[${labelSelector}]]//div[label/span[${valueSelector}]]//input[not(@disabled)]`);
        }
    }

    export namespace DataTable {
        // When user activates Button {string} in DataTable when column {int} is {string} 
        export async function activateRowButton(page: Page, butLabel: string, col: number, txt: string, bSearch: boolean) {
            if (bSearch) {
                let selector = `//div[contains(@class, "cds--search")]//input`;
                await PupUtil.elemType(page, selector, txt);
            }
            await PupUtil.elemClick(page, `//tr[td[${col+1}][text()='${txt}']]//span[contains(@class, 'cds--popover-container')][span[@role='tooltip']/span[text()='${butLabel}']]//button`)
        }
        // When user activates Button {string} in DataTable when column {int} is {string} 
        export async function activateRowLink(page: Page, linkTxt: string, col: number, txt: string, bSearch: boolean) {
            let linkSelector = linkTxt.includes(" ...") ? `starts-with(normalize-space(text()),'${linkTxt.replace(/ \.\.\./, "")}')` : `normalize-space(text())='${linkTxt}'`;
            if (bSearch) {
                let selector = `//div[contains(@class, "cds--search")]//input`;
                await PupUtil.elemType(page, selector, txt);
            }
            await PupUtil.elemClick(page, `//tr[td[${col+1}][.='${txt}']]//a[${linkSelector}]`);
        }
        // When user activates Checkbox in DataTable when column {int} is {string} 
        export async function activateRowCheckbox(page: Page, col: number, txt: string, bSearch: boolean) {
            if (bSearch) {
                let selector = `//div[contains(@class, "cds--search")]//input`;
                await PupUtil.elemType(page, selector, txt);
            }
            await PupUtil.elemClick(page, `//tr[td[${col+1}][.='${txt}']]//input[@type='checkbox']`);
        }
    }

    export namespace Tab {
        export async function select(page: Page, label: string) {
            await PupUtil.elemClick(page, `//button[@role='tab'][.='${label}']`);
        }
    }

    export namespace TextArea {
        export async function exists(scope: Page | ElementHandle<Node>, label: string) {
            await PupUtil.elemVisible(scope, `//div[contains(@class, "cds--form-item")][.//label[.='${label}']]//textarea`)
        }

        export async function type(scope: Page | ElementHandle<Node>, label: string, text: string) {
            let selector = `//div[contains(@class, "cds--form-item")][.//label[.='${label}']]//textarea`;
            await PupUtil.elemType(scope, selector, text);
        }
    } 

    export namespace TextInput {
        export async function exists(page: Page, label: string) {
            await PupUtil.elemVisible(page, `//div[contains(@class, "cds--text-input-wrapper")][.//label[text()='${label}']]//input`
                +`|//div[contains(@class, "cds--search")][label[text()='${label}']]//input`)
        }

        export async function exists_value(page: Page, label: string, value: string) {
            await PupUtil.elemVisible(page, `//div[contains(@class, "cds--text-input-wrapper")][.//label[text()='${label}']]//input`
                +`|//div[contains(@class, "cds--search")][label[text()='${label}']]//input[@value='${value}']`)
        }

        export async function type(page: Page, label: string, text: string) {
            let selector = `//div[contains(@class, "cds--text-input-wrapper")][.//label[text()='${label}']]//input`
                +`|//div[contains(@class, "cds--search")][label[text()='${label}']]//input`;
            await PupUtil.elemType(page, selector, text);
        }
        
        export async function clear(page: Page, label: string) { 
            await PupUtil.elemClear(page, `//div[contains(@class, "cds--text-input-wrapper")][.//label[text()='${label}']]//input`
                +`|//div[contains(@class, "cds--search")][label[text()='${label}']]//input`);
        }
    } 
}

