const BaseRepository = require('./baseRepository');
const Comment = require('../models/Comment');

class CommentRepository extends BaseRepository {
  constructor() {
    super(Comment);
  }

  async getByPostId(postId) {
    const docs = await this.Model.find({ postId }).lean();
    return docs.map(d => this._format(d));
  }
}

module.exports = new CommentRepository();
