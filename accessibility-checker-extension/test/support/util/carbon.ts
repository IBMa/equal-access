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
                let modal = await page.waitForXPath(`//div[contains(@class, 'cds--modal')][contains(@class, 'is-visible')]`, { timeout: 10 });
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

    export namespace Breadcrumb {
        export async function navigateTo(page: Page, txt: string) {
            let selector = `//a[text()='${txt}']`;
            await PupUtil.elemClick(page, selector);
        }
    
        export async function exists(page: Page, txt: string) {
            await PupUtil.elemVisible(page, `//a[text()='${txt}']`);
        }
    }
    
    export namespace CodeSnippet {
        export async function copyCode(page: Page, txt: string) {
            let selector = `//button[contains(@class, 'cds--snippet-button') and @aria-label='Copy code']`;
            await PupUtil.elemClick(page, selector);
        }
    
        export async function exists(page: Page) {
            await PupUtil.elemVisible(page, `//pre[contains(@class, 'cds--snippet')]`);
        }
    }
    
    export namespace ContainedList {
        export async function expandItem(page: Page, txt: string) {
            let selector = `//button[text()='${txt}']`;
            await PupUtil.elemClick(page, selector);
        }
    
        export async function exists(page: Page, txt: string) {
            await PupUtil.elemVisible(page, `//button[text()='${txt}']`);
        }
    }
    
    export namespace ContentSwitcher {
        export async function switchTo(page: Page, txt: string) {
            let selector = `//button[text()='${txt}']`;
            await PupUtil.elemClick(page, selector);
        }
    
        export async function exists(page: Page, txt: string) {
            await PupUtil.elemVisible(page, `//button[text()='${txt}']`);
        }
    }
    
    export namespace ContentSwitcher {
        export async function switchTo(page: Page, txt: string) {
            let selector = `//button[text()='${txt}']`;
            await PupUtil.elemClick(page, selector);
        }
    
        export async function exists(page: Page, txt: string) {
            await PupUtil.elemVisible(page, `//button[text()='${txt}']`);
        }
    }
    
    export namespace DatePicker {
        export async function selectDate(page: Page, date: string) {
            let selector = `//input[@type='text' and @placeholder='mm/dd/yyyy']`;
            await PupUtil.elemType(page, selector, date);
        }
    
        export async function exists(page: Page) {
            await PupUtil.elemVisible(page, `//input[@type='text' and @placeholder='mm/dd/yyyy']`);
        }
    }
    
    export namespace FileUploader {
        export async function uploadFile(page: Page, filePath: string) {
            let selector = `//input[@type='file']`;
            await page.setInputFiles(selector, filePath);
        }
    
        export async function exists(page: Page) {
            await PupUtil.elemVisible(page, `//input[@type='file']`);
        }
    }
    
    export namespace Form {
        export async function submit(page: Page, formId: string) {
            let selector = `//form[@id='${formId}']//button[@type='submit']`;
            await PupUtil.elemClick(page, selector);
        }
    
        export async function exists(page: Page, formId: string) {
            await PupUtil.elemVisible(page, `//form[@id='${formId}']`);
        }
    }
    
    export namespace Form {
        export async function submit(page: Page, formId: string) {
            let selector = `//form[@id='${formId}']//button[@type='submit']`;
            await PupUtil.elemClick(page, selector);
        }
    
        export async function exists(page: Page, formId: string) {
            await PupUtil.elemVisible(page, `//form[@id='${formId}']`);
        }
    }
    
    export namespace InlineLoading {
        export async function waitForCompletion(page: Page) {
            let selector = `//div[contains(@class, 'cds--inline-loading__text')]`;
            await PupUtil.elemInvisible(page, selector);
        }
    
        export async function exists(page: Page) {
            await PupUtil.elemVisible(page, `//div[contains(@class, 'cds--inline-loading')]`);
        }
    }
    
    export namespace List {
        export async function selectItem(page: Page, txt: string) {
            let selector = `//li[text()='${txt}']`;
            await PupUtil.elemClick(page, selector);
        }
    
        export async function exists(page: Page, txt: string) {
            await PupUtil.elemVisible(page, `//li[text()='${txt}']`);
        }
    }
    
    export namespace Loading {
        export async function waitForLoading(page: Page) {
            let selector = `//div[contains(@class, 'cds--loading')]`;
            await PupUtil.elemInvisible(page, selector);
        }
    
        export async function exists(page: Page) {
            await PupUtil.elemVisible(page, `//div[contains(@class, 'cds--loading')]`);
        }
    }
    
    export namespace MenuButtons {
        export async function openMenu(page: Page, txt: string) {
            let selector = `//button[text()='${txt}']`;
            await PupUtil.elemClick(page, selector);
        }
    
        export async function exists(page: Page, txt: string) {
            await PupUtil.elemVisible(page, `//button[text()='${txt}']`);
        }
    }
    
    export namespace NumberInput {
        export async function setNumber(page: Page, value: number) {
            let selector = `//input[@type='number']`;
            await PupUtil.elemType(page, selector, value.toString());
        }
    
        export async function exists(page: Page) {
            await PupUtil.elemVisible(page, `//input[@type='number']`);
        }
    }
    
    export namespace Pagination {
        export async function goToPage(page: Page, pageNumber: string) {
            let selector = `//button[text()='${pageNumber}']`;
            await PupUtil.elemClick(page, selector);
        }
    
        export async function exists(page: Page) {
            await PupUtil.elemVisible(page, `//div[contains(@class, 'cds--pagination')]`);
        }
    }
    
    export namespace Popover {
        export async function openPopover(page: Page, txt: string) {
            let selector = `//button[@aria-label='${txt}']`;
            await PupUtil.elemClick(page, selector);
        }
    
        export async function exists(page: Page, txt: string) {
            await PupUtil.elemVisible(page, `//button[@aria-label='${txt}']`);
        }
    }
    
    export namespace ProgressBar {
        export async function waitForCompletion(page: Page) {
            let selector = `//div[contains(@class, 'cds--progress-bar')]`;
            await PupUtil.elemInvisible(page, selector);
        }
    
        export async function exists(page: Page) {
            await PupUtil.elemVisible(page, `//div[contains(@class, 'cds--progress-bar')]`);
        }
    }
    
    export namespace Tag {
        export async function closeTag(page: Page, txt: string) {
            let selector = `//span[text()='${txt}']/following-sibling::button`;
            await PupUtil.elemClick(page, selector);
        }
    
        export async function exists(page: Page, txt: string) {
            await PupUtil.elemVisible(page, `//span[text()='${txt}']`);
        }
    }
    
    export namespace Tile {
        export async function selectTile(page: Page, txt: string) {
            let selector = `//span[text()='${txt}']`;
            await PupUtil.elemClick(page, selector);
        }
    
        export async function exists(page: Page, txt: string) {
            await PupUtil.elemVisible(page, `//span[text()='${txt}']`);
        }
    }
    
    export namespace Toggle {
        export async function toggle(page: Page, txt: string) {
            let selector = `//label[@for='${txt}']`;
            await PupUtil.elemClick(page, selector);
        }
    
        export async function exists(page: Page, txt: string) {
            await PupUtil.elemVisible(page, `//label[@for='${txt}']`);
        }
    }
    
    export namespace Toggletip {
        export async function openTip(page: Page, txt: string) {
            let selector = `//button[@aria-label='${txt}']`;
            await PupUtil.elemClick(page, selector);
        }
    
        export async function exists(page: Page, txt: string) {
            await PupUtil.elemVisible(page, `//button[@aria-label='${txt}']`);
        }
    }
    
    export namespace Tooltip {
        export async function showTooltip(page: Page, txt: string) {
            let selector = `//button[@aria-label='${txt}']`;
            await PupUtil.elemHover(page, selector);
        }
    
        export async function exists(page: Page, txt: string) {
            await PupUtil.elemVisible(page, `//button[@aria-label='${txt}']`);
        }
    }
    
    export namespace Treeview {
        export async function expandNode(page: Page, txt: string) {
            let selector = `//span[text()='${txt}']/ancestor::button`;
            await PupUtil.elemClick(page, selector);
        }
    
        export async function exists(page: Page, txt: string) {
            await PupUtil.elemVisible(page, `//span[text()='${txt}']`);
        }
    }
    
    export namespace UIShell {
        export async function openMenu(page: Page, txt: string) {
            let selector = `//button[@aria-label='${txt}']`;
            await PupUtil.elemClick(page, selector);
        }
    
        export async function exists(page: Page, txt: string) {
            await PupUtil.elemVisible(page, `//button[@aria-label='${txt}']`);
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
    // Dropdown 2 with label
    export namespace Dropdown {
        export async function isEnabled(page: Page, label: string) {
            // Assuming the dropdown has a specific label associated with it
            const selector = `//div[label[contains(text(), '${label}')]]//button[not(contains(@class, 'cds--btn--disabled'))]`;
            await PupUtil.elemVisible(page, selector);
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

    export namespace Checkbox {
        export async function set(page: Page, label: string, setChecked: boolean) {
            let labelTextSelector = label.includes(" ...") ? `starts-with(normalize-space(text()),'${label.replace(/ \.\.\./, "")}')` : `normalize-space(text())='${label}'`;
            let inputSelector = `//div[label/span[${labelTextSelector}]]/input`;
            let labelSelector = `//div[label/span[${labelTextSelector}]]/label`;
            
            const isChecked = await PupUtil.evalScript(page, inputSelector, (elem) => ((elem as any).checked));
            if (isChecked !== setChecked) {
                // Toggle if the values don't match
                await PupUtil.elemClick(page, labelSelector);
            }

            await Checkbox.checked_state_is(page, label, setChecked);
        }

        export async function checked_state_is(page: Page, label: string, checkVal: boolean) {
            let labelTextSelector = label.includes(" ...") ? `starts-with(normalize-space(text()),'${label.replace(/ \.\.\./, "")}')` : `normalize-space(text())='${label}'`;
            let inputSelector = `//div[label/span[${labelTextSelector}]]/input`;
            await PupUtil.waitState(async () => {
                const isChecked = await PupUtil.evalScript(page, inputSelector, (elem) => ((elem as any).checked));
                return isChecked === checkVal;
            })
        }
    }

    export namespace Multiselect {
        export async function activate(page: Page, label: string, values: string[]) {
            let msLabel = `//div[label[contains(text(), '${label}')]]/label|//button[@role='combobox'][.//*[@class='cds--list-box__label'][.='${label}']]`;
            await PupUtil.elemClick(page, msLabel);
            await PupUtil.evalScript(page, msLabel, (elem) => {
                let selectedItems = elem.querySelectorAll("li[aria-selected='true']");
                for (const selectedItem of selectedItems) {
                    (selectedItem as any).click();
                }
            })
            for (const value of values) {
                await PupUtil.elemClick(page, `//div[label[contains(text(), '${label}')]]//li[.='${value}']`);
            }
            await PupUtil.elemPress(page, msLabel, "Escape");
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

