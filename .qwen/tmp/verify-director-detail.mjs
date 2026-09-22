import puppeteer from "puppeteer-core";

const EXEC = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://localhost:5173";
const OUT = "/tmp/gzt-shots";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: EXEC,
  headless: "new",
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--font-render-hinting=none",
  ],
});

const page = await browser.newPage();
await page.setViewport({ width: 1680, height: 1150, deviceScaleFactor: 1 });

async function selectRole(label) {
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("header button")].find((b) =>
      b.textContent?.includes("当前角色"),
    );
    btn.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    btn.click();
  });
  await wait(700);
  await page.evaluate((want) => {
    const hit = [...document.querySelectorAll(".ant-dropdown-menu-item")].find(
      (i) => i.textContent?.trim() === want,
    );
    hit.click();
  }, label);
  await wait(1200);
}

async function gotoManagement() {
  await page.evaluate(() => {
    [...document.querySelectorAll(".gq-app-menu a")]
      .find((a) => a.textContent?.trim().includes("履职管理"))
      .click();
  });
  await wait(1500);
}

await page.goto(`${BASE}/boardGovernance/appointment`, {
  waitUntil: "networkidle2",
  timeout: 60000,
});
await wait(1500);
await selectRole("董事");
await gotoManagement();

await page.evaluate(() => {
  [...document.querySelectorAll(".ant-table-tbody button")]
    .find((b) => b.textContent?.includes("查看详情"))
    ?.click();
});
await wait(2000);
const state = await page.evaluate(() => ({
  path: location.pathname,
  drawerTitle:
    document.querySelector(".ant-drawer-title")?.textContent?.trim() ?? null,
  drawerHasDutyTabs: !!document.querySelector(".ant-drawer .ant-tabs"),
}));
console.log(`[董事] detail -> ${state.path}`);
console.log(`       drawer title = ${state.drawerTitle}`);
console.log(`       drawer has duty tabs = ${state.drawerHasDutyTabs}`);
await page.screenshot({
  path: `${OUT}/mgmt-director-detail.png`,
  fullPage: true,
});

await browser.close();
