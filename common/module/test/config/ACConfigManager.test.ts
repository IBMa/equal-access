import { ACConfigManager, compareVersions } from "../../src/config/ACConfigManager"
test("Configuration loads", async () => {
    const config = await ACConfigManager.getConfig();
    // console.log(config);
})

test("Version compare", async () => {
    expect(compareVersions("0.0.0", "0.0.0")).toBe(0);
    expect(compareVersions("0.0.0", "0.0.1")).toBeLessThan(0);
    expect(compareVersions("0.0.0", "0.1.0")).toBeLessThan(0);
    expect(compareVersions("0.0.0", "1.0.0")).toBeLessThan(0);
    expect(compareVersions("0.0.1", "0.0.0")).toBeGreaterThan(0);
    expect(compareVersions("0.1.0", "0.0.0")).toBeGreaterThan(0);
    expect(compareVersions("1.0.0", "0.0.0")).toBeGreaterThan(0);
    expect(compareVersions("1.0.0", "1.0")).toBeGreaterThan(0);
    expect(compareVersions("1.0.0", "1.0.0-rc.0")).toBeGreaterThan(0);
    expect(compareVersions("1.0.0-rc.0", "1.0.0")).toBeLessThan(0);
    expect(compareVersions("1.0.0-rc.0", "1.0.0-rc.1")).toBeLessThan(0);
    expect(compareVersions("1.0.0-rc.1", "1.0.0-rc.0")).toBeGreaterThan(0);
})