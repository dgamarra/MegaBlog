const natural = require('natural');

class NlpService {
  constructor() {
    this.analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    this.tokenizer = new natural.WordTokenizer();
  }

  analyzeSentiment(text) {
    const tokens = this.tokenizer.tokenize(text);
    const score = this.analyzer.getSentiment(tokens);
    
    let sentiment = 'neutral';
    if (score > 0.2) sentiment = 'positive';
    else if (score < -0.2) sentiment = 'negative';
    
    return { score, sentiment };
  }

  extractKeywords(text, limit = 5) {
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    const stopwords = natural.stopwords;
    
    // Filter stopwords and short words
    const filtered = tokens.filter(token => 
      !stopwords.includes(token) && 
      token.length > 3
    );

    const freq = {};
    filtered.forEach(word => {
      freq[word] = (freq[word] || 0) + 1;
    });

    const keywords = Object.keys(freq)
      .sort((a, b) => freq[b] - freq[a])
      .slice(0, limit);

    return keywords;
  }

  getAnalysis(text) {
    const sentiment = this.analyzeSentiment(text);
    const keywords = this.extractKeywords(text);
    return { ...sentiment, keywords };
  }
}

module.exports = new NlpService();
