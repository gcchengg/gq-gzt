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
page.on("console", (m) => {
  if (m.type() === "error")
    console.log(`  [console.error] ${m.text().slice(0, 300)}`);
});
page.on("pageerror", (e) =>
  console.log(`  [pageerror] ${String(e).slice(0, 400)}`),
);

async function selectRole(label) {
  const opened = await page.evaluate(() => {
    const btn = [...document.querySelectorAll("header button")].find((b) =>
      b.textContent?.includes("当前角色"),
    );
    if (!btn) return false;
    btn.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    btn.click();
    return true;
  });
  if (!opened) throw new Error("role switcher button not found");
  await wait(700);
  const picked = await page.evaluate((want) => {
    const items = [...document.querySelectorAll(".ant-dropdown-menu-item")];
    const hit = items.find((i) => i.textContent?.trim() === want);
    if (!hit)
      return `not-found (have: ${items.map((i) => i.textContent?.trim()).join("|")})`;
    hit.click();
    return "ok";
  }, label);
  if (picked !== "ok") throw new Error(`role menu item ${label}: ${picked}`);
  await wait(1200);
}

async function gotoManagement() {
  const clicked = await page.evaluate(() => {
    const link = [...document.querySelectorAll(".gq-app-menu a")].find((a) =>
      a.textContent?.trim().includes("履职管理"),
    );
    if (!link) return false;
    link.click();
    return true;
  });
  if (!clicked) throw new Error("履职管理 sidebar link not found");
  await wait(1500);
  return page.evaluate(() => location.pathname);
}

function readRows() {
  return page.evaluate(() =>
    [...document.querySelectorAll(".ant-table-tbody tr")]
      .map((tr) => {
        const strong = tr.querySelector("strong");
        const small = tr.querySelector("strong + small, span small");
        return strong
          ? `${strong.textContent.trim()} / ${small?.textContent.trim() ?? ""}`
          : null;
      })
      .filter(Boolean),
  );
}

await page.goto(`${BASE}/boardGovernance/appointment`, {
  waitUntil: "networkidle2",
  timeout: 60000,
});
await wait(1500);

// --- Baseline: 综合管理部 sees the full management-stage roster ---
await selectRole("综合管理部");
const adminPath = await gotoManagement();
const adminRows = await readRows();
console.log(`[综合管理部] path=${adminPath} rows=${adminRows.length}`);
console.log(adminRows.map((r) => `    - ${r}`).join("\n"));
await page.screenshot({
  path: `${OUT}/mgmt-adminDepartment.png`,
  fullPage: true,
});

// --- Target: 董事 sees only 张铁斌 ---
await selectRole("董事");
const directorPath = await gotoManagement();
const directorRows = await readRows();
console.log(`[董事] path=${directorPath} rows=${directorRows.length}`);
console.log(directorRows.map((r) => `    - ${r}`).join("\n"));
await page.screenshot({ path: `${OUT}/mgmt-director.png`, fullPage: true });

const meta = await page.evaluate(
  () =>
    document.querySelector("main")?.textContent?.match(/\d+ 位董事/)?.[0] ??
    null,
);
console.log(`[董事] table meta = ${meta}`);

// --- Detail route for another director should be blocked under 董事 role ---
await page.evaluate(() =>
  window.history.pushState({}, "", "/boardGovernance/management/D-03"),
);
await wait(1500);
const blocked = await page.evaluate(() => ({
  path: location.pathname,
  drawerText:
    document
      .querySelector(".ant-drawer-body, .ant-drawer")
      ?.textContent?.slice(0, 160) ?? null,
}));
console.log(`[董事] foreign detail route -> ${blocked.path}`);
console.log(`       drawer: ${blocked.drawerText}`);
await page.screenshot({
  path: `${OUT}/mgmt-director-foreign.png`,
  fullPage: true,
});

const verdict =
  directorRows.length === 1 && directorRows[0].startsWith("张铁斌")
    ? "PASS: 董事 role shows only 张铁斌"
    : `FAIL: 董事 role shows ${directorRows.length} rows -> ${JSON.stringify(directorRows)}`;
console.log(`\n${verdict}`);

await browser.close();
