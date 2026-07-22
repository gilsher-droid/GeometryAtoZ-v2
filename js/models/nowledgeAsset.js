class KnowledgeAsset {
  constructor({
    id,
    type,
    title,
    sourceLessonId = "",
    mediaUrl = "",
    transcript = "",
    summary = "",
    tags = [],
    durationSeconds = null,
    startTime = null,
    endTime = null,
    verificationStatus = "machine-generated",
    metadata = {}
  }) {
    if (!id) {
      throw new Error(
        "KnowledgeAsset requires a valid id."
      );
    }

    if (!type) {
      throw new Error(
        "KnowledgeAsset requires a type."
      );
    }

    this.id = id;
    this.type = type;
    this.title = title || "";

    this.sourceLessonId =
      sourceLessonId;

    this.mediaUrl = mediaUrl;
    this.transcript = transcript;
    this.summary = summary;

    this.tags = Array.isArray(tags)
      ? [...tags]
      : [];

    this.durationSeconds =
      durationSeconds;

    this.startTime = startTime;
    this.endTime = endTime;

    /*
      Examples:

      machine-generated
      visually-verified
      human-reviewed
      publication-ready
    */
    this.verificationStatus =
      verificationStatus;

    this.metadata = {
      ...metadata
    };

    this.createdAt =
      new Date().toISOString();

    this.updatedAt =
      this.createdAt;
  }

  hasTag(tag) {
    return this.tags.includes(tag);
  }

  addTag(tag) {
    if (
      tag &&
      !this.tags.includes(tag)
    ) {
      this.tags.push(tag);
      this.touch();
    }
  }

  setVerificationStatus(status) {
    this.verificationStatus =
      status;

    this.touch();
  }

  isPublicationReady() {
    return (
      this.verificationStatus ===
      "publication-ready"
    );
  }

  touch() {
    this.updatedAt =
      new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      sourceLessonId:
        this.sourceLessonId,
      mediaUrl: this.mediaUrl,
      transcript: this.transcript,
      summary: this.summary,
      tags: [...this.tags],
      durationSeconds:
        this.durationSeconds,
      startTime: this.startTime,
      endTime: this.endTime,
      verificationStatus:
        this.verificationStatus,
      metadata: {
        ...this.metadata
      },
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

window.KnowledgeAsset =
  KnowledgeAsset;
