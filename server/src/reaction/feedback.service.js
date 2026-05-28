// feedback.service.js

import {
  getFindingByCommentId
} from "../review/findings.repository.js";

import {
  createFeedback
} from "./feedback.repository.js";

import {
  reactionMeaningMap
} from "./reaction.mapper.js";

export const handleReactionFeedback =
  async (payload) => {

    try {

      const reaction =
        payload.reaction;

      const comment =
        payload.comment;

      // Ignore non-bot comments
      if (
        comment.user.login !==
        "tzylo[bot]" && comment.user.type !== "tzylo-synapse[bot]"
      ) {
        return;
      }

      const finding =
        await getFindingByCommentId(
          comment.id
        );

      if (!finding) {
        return;
      }

      const meaning =
        reactionMeaningMap[
          reaction.content
        ];

      if (!meaning) {
        return;
      }

      const savedFeedback =
        await createFeedback({
          findingId:
            finding.id,

          githubUser:
            payload.sender.login,

          reaction:
            reaction.content,

          meaning
        });

      console.log(
        "✅ Feedback saved",
        savedFeedback.id
      );

      return savedFeedback;

    } catch (error) {

      console.error(
        "❌ Failed to save feedback",
        error
      );
    }
  };