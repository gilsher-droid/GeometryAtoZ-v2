class KnowledgeRepository {
  constructor() {
    this.assets = {};
  }

  addAsset(asset) {
    if (
      !(asset instanceof KnowledgeAsset)
    ) {
      throw new Error(
        "KnowledgeRepository accepts only KnowledgeAsset instances."
      );
    }

    this.assets[asset.id] =
      asset;

    return asset;
  }

  removeAsset(assetId) {
    if (!this.assets[assetId]) {
      return false;
    }

    delete this.assets[assetId];

    return true;
  }

  getAsset(assetId) {
    return (
      this.assets[assetId] ||
      null
    );
  }

  hasAsset(assetId) {
    return Boolean(
      this.assets[assetId]
    );
  }

  getAllAssets() {
    return Object.values(
      this.assets
    );
  }

  findByType(type) {
    return this.getAllAssets()
      .filter(
        (asset) =>
          asset.type === type
      );
  }

  findByTag(tag) {
    return this.getAllAssets()
      .filter(
        (asset) =>
          asset.hasTag(tag)
      );
  }

  findBySourceLesson(
    sourceLessonId
  ) {
    return this.getAllAssets()
      .filter(
        (asset) =>
          asset.sourceLessonId ===
          sourceLessonId
      );
  }

  findPublicationReady() {
    return this.getAllAssets()
      .filter(
        (asset) =>
          asset.isPublicationReady()
      );
  }

  search({
    type = null,
    tags = [],
    sourceLessonId = null,
    publicationReadyOnly = false
  } = {}) {
    let results =
      this.getAllAssets();

    if (type) {
      results = results.filter(
        (asset) =>
          asset.type === type
      );
    }

    if (sourceLessonId) {
      results = results.filter(
        (asset) =>
          asset.sourceLessonId ===
          sourceLessonId
      );
    }

    if (
      Array.isArray(tags) &&
      tags.length > 0
    ) {
      results = results.filter(
        (asset) =>
          tags.every(
            (tag) =>
              asset.hasTag(tag)
          )
      );
    }

    if (publicationReadyOnly) {
      results = results.filter(
        (asset) =>
          asset.isPublicationReady()
      );
    }

    return results;
  }

  clear() {
    this.assets = {};
  }

  toJSON() {
    return this.getAllAssets()
      .map(
        (asset) =>
          asset.toJSON()
      );
  }
}

window.KnowledgeRepository =
  KnowledgeRepository;
