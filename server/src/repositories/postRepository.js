const BaseRepository = require('./baseRepository');
const Post = require('../models/Post');

class PostRepository extends BaseRepository {
  constructor() {
    super(Post);
  }

  async search(query) {
    if (!query) return this.getAll();
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    const docs = await this.Model.find({
      $or: [
        { title: { $regex: regex } },
        { content: { $regex: regex } },
        { keywords: { $regex: regex } }
      ]
    }).lean();
    return docs.map(d => this._format(d));
  }
}

module.exports = new PostRepository();
