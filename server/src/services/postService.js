const postRepository = require('../repositories/postRepository');
const userRepository = require('../repositories/userRepository');
const nlpService = require('./nlpService');

class PostService {
  async getAllPosts() {
    return await postRepository.getAll();
  }

  async getPostById(id) {
    return await postRepository.getById(id);
  }

  async createPost(postData, authorId) {
    const nlpAnalysis = nlpService.getAnalysis(postData.content);
    const author = await userRepository.getById(authorId);
    
    return await postRepository.create({
      ...postData,
      authorId,
      authorName: author ? author.name : '',
      ...nlpAnalysis
    });
  }

  async updatePost(id, postData, authorId, isAdmin = false) {
    const post = await postRepository.getById(id);
    if (!post) throw new Error('Post not found');
    
    if (post.authorId !== authorId && !isAdmin) {
      throw new Error('Unauthorized');
    }

    let updates = { ...postData };
    if (postData.content) {
      const nlpAnalysis = nlpService.getAnalysis(postData.content);
      updates = { ...updates, ...nlpAnalysis };
    }

    return await postRepository.update(id, updates);
  }

  async deletePost(id, authorId, isAdmin = false) {
    const post = await postRepository.getById(id);
    if (!post) throw new Error('Post not found');

    if (post.authorId !== authorId && !isAdmin) {
      throw new Error('Unauthorized');
    }

    return await postRepository.delete(id);
  }

  async searchPosts(query) {
    return await postRepository.search(query);
  }
}

module.exports = new PostService();
