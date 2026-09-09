import puppeteer from "puppeteer-core";

const EXEC = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://localhost:5173";
const OUT = "/tmp/gzt-shots";

const shots = [
  {
    name: "01-applications-pool",
    path: "/expertTalentApplications",
    steps: [],
  },
  {
    name: "02-applications-invitations",
    path: "/expertTalentApplications",
    steps: [{ clickText: "入库办理" }],
  },
  {
    name: "03-applications-invitations-filtered",
    path: "/expertTalentApplications",
    steps: [{ clickText: "入库办理" }, { clickText: "待资料核对" }],
  },
  {
    name: "04-applications-drawer",
    path: "/expertTalentApplications",
    steps: [{ clickText: "入库办理" }, { clickText: "办理详情" }],
  },
  {
    name: "05-applications-sms",
    path: "/expertTalentApplications",
    steps: [{ clickText: "短信通知记录" }],
  },
  {
    name: "06-reference-companyMaintenance",
    path: "/companyMaintenanceList",
    steps: [],
  },
];

async function clickByText(page, text) {
  const ok = await page.evaluate((needle) => {
    const nodes = [...document.querySelectorAll("button, .ant-tabs-tab, a")];
    const hit = nodes.find((n) => n.textContent?.trim().includes(needle));
    if (!hit) return false;
    hit.click();
    return true;
  }, text);
  if (!ok) console.log(`  ! click target not found: ${text}`);
  await new Promise((r) => setTimeout(r, 900));
}

const browser = await puppeteer.launch({
  executablePath: EXEC,
  headless: "new",
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--font-render-hinting=none",
  ],
});

for (const shot of shots) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1680, height: 1150, deviceScaleFactor: 1 });
  page.on("console", (m) => {
    if (m.type() === "error")
      console.log(`  [console.error] ${m.text().slice(0, 300)}`);
  });
  page.on("pageerror", (e) =>
    console.log(`  [pageerror] ${String(e).slice(0, 400)}`),
  );
  await page.goto(BASE + shot.path, {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  await new Promise((r) => setTimeout(r, 1200));
  for (const step of shot.steps) {
    if (step.clickText) await clickByText(page, step.clickText);
  }
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: `${OUT}/${shot.name}.png`, fullPage: true });
  const overflow = await page.evaluate(() => {
    const el = document.querySelector(".ant-table-body, .ant-table-content");
    return el ? { sw: el.scrollWidth, cw: el.clientWidth } : null;
  });
  console.log(`ok ${shot.name} tableOverflow=${JSON.stringify(overflow)}`);
  await page.close();
}

await browser.close();
