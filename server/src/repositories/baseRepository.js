class BaseRepository {
  constructor(model) {
    this.Model = model;
  }

  async getAll() {
    const docs = await this.Model.find({}).lean();
    return docs.map(d => this._format(d));
  }

  async getById(id) {
    const doc = await this.Model.findById(id).lean();
    return this._format(doc);
  }

  async create(item) {
    const doc = await this.Model.create(item);
    return this._format(doc.toObject());
  }

  async update(id, updates) {
    const doc = await this.Model.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();
    return this._format(doc);
  }

  async delete(id) {
    const doc = await this.Model.findByIdAndDelete(id);
    return doc !== null;
  }

  async findOne(query) {
    const doc = await this.Model.findOne(query).lean();
    return this._format(doc);
  }

  _format(doc) {
    if (!doc) return null;
    const { _id, __v, ...rest } = doc;
    return { id: _id, ...rest };
  }
}

module.exports = BaseRepository;
