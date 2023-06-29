import { ACConfigManager } from "../../src/config/ACConfigManager"
test("Configuration loads", async () => {
    const config = await ACConfigManager.getConfig();
    // console.log(config);
})