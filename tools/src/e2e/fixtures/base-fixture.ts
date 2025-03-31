import type { FullProject, Page } from "@playwright/test";

export default class {
  readonly page: Page;
  readonly project: FullProject;

  constructor(page: Page, project: FullProject) {
    this.page = page;
    this.project = project;
  }

  startCoverage = async () => {
    if (this.project.name !== "chromium") return;

    await this.page.coverage.startCSSCoverage({ resetOnNavigation: false });
    await this.page.coverage.startJSCoverage({ resetOnNavigation: false });
  };

  stopCoverage = async () => {
    if (this.project.name !== "chromium") return;

    const cssCoverage = await this.page.coverage.stopCSSCoverage();
    const jsCoverage = await this.page.coverage.stopJSCoverage();
    return [...cssCoverage, ...jsCoverage];
  };
}
