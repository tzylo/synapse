import {
  fetchPRDiff,
  fetchTzyloConfig
} from "../github/github.service.js";

import {
  getTzyloDocumentation,
  commitTzyloDocumentation
} from "../github/github.write.js";

import {
  generateMemoryDocument
} from "../agents/memory/memoryDocument.agent.js";

import {
  classifyMemorySections
} from "../agents/memory/sectionClassifier.agent.js";

import {
  updateSectionMemory
} from "../agents/memory/sectionUpdater.agent.js";

import {
  extractSection
} from "./sections/extractSection.js";

import {
  replaceSection
} from "./sections/replaceSection.js";

import Logger
  from "../utils/logger/index.js";

const logger =
  new Logger("MemoryPipeline");

export const memoryPipeline =
  async ({
    prApiUrl,
    installationId,
    prTitle,
    prDescription,
    branch
  }) => {

    // =====================
    // Fetch diff
    // =====================

    const diff =
      await fetchPRDiff(
        prApiUrl,
        installationId
      );

    // =====================
    // Fetch config
    // =====================

    let tzyloConfig = null;

    try {

      tzyloConfig =
        await fetchTzyloConfig(
          prApiUrl,
          installationId
        );

    } catch (error) {

      logger.warn(
        "Could not fetch tzylo.config.json"
      );
    }

    // =====================
    // Agent 1
    // Generate memory
    // =====================

    const memoryDocument =
      await generateMemoryDocument({
        diff,
        prTitle,
        prDescription
      });

    // =====================
    // Agent 2
    // Classify sections
    // =====================

    const {
      sections
    } =
      await classifyMemorySections(
        memoryDocument
      );

    // =====================
    // Fetch current TZYLO.md
    // =====================

    const {
      content: tzyloMd,
      sha
    } =
      await getTzyloDocumentation({
        prApiUrl,
        installationId
      });

    let updatedDoc = tzyloMd;

    // =====================
    // Agent 3
    // Update sections
    // =====================

    for (const section of sections) {

      const existingSection =
        extractSection(
          updatedDoc,
          section
        );

      const updatedSection =
        await updateSectionMemory({
          sectionName: section,
          existingContent:
            existingSection,
          newMemory:
            memoryDocument
        });

      updatedDoc =
        replaceSection(
          updatedDoc,
          section,
          updatedSection
        );
    }

    // =====================
    // Commit final markdown
    // =====================

    await commitTzyloDocumentation({
      prApiUrl,
      installationId,
      content: updatedDoc,
      sha,
      branch
    });

    logger.info(
      "TZYLO.md updated"
    );
  };