import LoginPage from '../pageobjects/login.page'
import SecurePage from '../pageobjects/secure.page'
import { getCompliance } from "accessibility-checker";

describe('My Login application', () => {
    it('should login with valid credentials', async () => {
        await LoginPage.open()
        console.log(browser.constructor);
        console.log(await getCompliance(browser, "TEST"));
        await LoginPage.login('tomsmith', 'SuperSecretPassword!')
        await expect(SecurePage.flashAlert).toBeExisting()
        await expect(SecurePage.flashAlert).toHaveTextContaining(
            'You logged into a secure area!')
    })
})


