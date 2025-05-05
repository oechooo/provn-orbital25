import { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, ProgressBar, Badge } from 'react-bootstrap';

// Mock article data
const mockArticle = {
  id: 2,
  title: "Global Leaders Meet to Discuss Climate Change Solutions",
  source: "World Politics",
  author: "Jane Smith",
  publishDate: "May 4, 2025",
  content: `
    <p>Representatives from 45 countries gathered this week at the International Climate Summit to propose new policies addressing rising global temperatures and extreme weather events. The summit, held in Geneva, Switzerland, marks the first major international climate conference since the Paris Agreement was updated last year.</p>
    
    <p>Key topics on the agenda included carbon emission reduction targets, financing for developing nations to transition to clean energy, and cooperation on technology sharing. The urgency of the meeting was underscored by recent reports showing global temperatures could rise by more than 1.5°C above pre-industrial levels within the next decade.</p>
    
    <p>"We no longer have the luxury of time," said UN Secretary-General António Guterres in his opening address. "The science is clear, and the impacts are being felt in every region of the world. This summit must produce concrete actions, not just promises."</p>
    
    <p>Several major economies, including the United States, China, and the European Union, announced new pledges to achieve carbon neutrality by 2045, five years earlier than previously committed. Additionally, a coalition of private sector companies pledged over $300 billion in investments for renewable energy projects in developing countries.</p>
    
    <p>Climate activists, however, remain skeptical about whether these commitments will translate into meaningful action. "We've heard similar promises before," said environmental activist Greta Thunberg, who led a protest outside the summit venue. "What we need is immediate and drastic reduction in emissions, not distant targets."</p>
    
    <p>The summit will continue for three more days, with working groups focusing on specific sectors such as transportation, agriculture, and energy production.</p>
  `,
  confidence: 78,
  imageUrl: "https://images.unsplash.com/photo-1569049176129-24fe2c56ec92?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
  votesTrue: 342,
  votesFalse: 97,
  sourceReliability: 82,
  comments: [
    { id: 1, user: "ClimateExpert", text: "The article accurately reports the summit's goals, but the $300B figure seems high based on official statements.", timestamp: "2 hours ago" },
    { id: 2, user: "EcoWatcher", text: "I attended the summit and can confirm most of these details are accurate.", timestamp: "5 hours ago" },
    { id: 3, user: "FactChecker", text: "The quote from Greta Thunberg is accurate - I verified against video footage from the protest.", timestamp: "yesterday" }
  ]
};

const ArticleDetailPage = () => {
  const [userVote, setUserVote] = useState<'true' | 'false' | null>(null);
  const [comment, setComment] = useState('');
  
  // Calculate the truth percentage based on votes
  const totalVotes = mockArticle.votesTrue + mockArticle.votesFalse;
  const truthPercentage = Math.round((mockArticle.votesTrue / totalVotes) * 100);
  
  // Handle voting
  const handleVote = (vote: 'true' | 'false') => {
    setUserVote(vote);
    // In a real app, this would send the vote to the backend
  };
  
  // Handle comment submission
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the comment to the backend
    alert('Comment submitted: ' + comment);
    setComment('');
  };

  return (
    <Container className="py-5">
      {/* Article Header */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 text-muted mb-2 small">
          <span>{mockArticle.source}</span>
          <span>•</span>
          <span>{mockArticle.publishDate}</span>
          {mockArticle.author && (
            <>
              <span>•</span>
              <span>By {mockArticle.author}</span>
            </>
          )}
        </div>
        
        <h1 className="display-5 fw-bold mb-4">{mockArticle.title}</h1>
        
        <div className="d-flex flex-wrap gap-3 mb-4">
          <div className="bg-primary bg-opacity-10 px-3 py-2 rounded d-flex align-items-center gap-2">
            <span className="fw-medium">Confidence Score:</span>
            <span className={`fw-bold ${
              mockArticle.confidence >= 80 
                ? 'text-success' 
                : mockArticle.confidence >= 50 
                ? 'text-warning' 
                : 'text-danger'
            }`}>
              {mockArticle.confidence}%
            </span>
          </div>
          
          <div className="bg-success bg-opacity-10 px-3 py-2 rounded d-flex align-items-center gap-2">
            <span className="fw-medium">Source Reliability:</span>
            <span className="fw-bold text-success">{mockArticle.sourceReliability}%</span>
          </div>
        </div>
      </div>
      
      {/* Article Image */}
      {mockArticle.imageUrl && (
        <div className="mb-4">
          <img 
            src={mockArticle.imageUrl} 
            alt={mockArticle.title} 
            className="img-fluid rounded w-100"
            style={{ maxHeight: '400px', objectFit: 'cover' }}
          />
        </div>
      )}
      
      {/* Article Content */}
      <div 
        className="mb-5" 
        dangerouslySetInnerHTML={{ __html: mockArticle.content }}
      />
      
      {/* Prediction Market */}
      <Card className="shadow-soft mb-5">
        <Card.Body className="p-4">
          <h2 className="h4 fw-bold mb-4">Truth Prediction Market</h2>
          
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>Truth Likelihood</span>
              <span className="fw-bold">{truthPercentage}%</span>
            </div>
            
            <ProgressBar variant="primary" now={truthPercentage} className="mb-2" />
            
            <div className="d-flex justify-content-between small text-muted">
              <span>{mockArticle.votesTrue} votes true</span>
              <span>{mockArticle.votesFalse} votes false</span>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="h5 fw-medium mb-3">Cast Your Vote</h3>
            
            <div className="d-flex gap-3">
              <Button 
                onClick={() => handleVote('true')} 
                variant={userVote === 'true' ? 'success' : 'outline-secondary'}
                className="flex-grow-1 py-2"
              >
                Accurate
              </Button>
              
              <Button 
                onClick={() => handleVote('false')} 
                variant={userVote === 'false' ? 'danger' : 'outline-secondary'}
                className="flex-grow-1 py-2"
              >
                Inaccurate
              </Button>
            </div>
            
            {userVote && (
              <div className="mt-3 small text-muted">
                You voted this article is {userVote === 'true' ? 'accurate' : 'inaccurate'}.
                Your vote has been recorded and will help determine the truth value.
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
      
      {/* Comments Section */}
      <Card className="shadow-soft">
        <Card.Body className="p-4">
          <h2 className="h4 fw-bold mb-4">Expert Commentary</h2>
          
          <div className="mb-4">
            {mockArticle.comments.map(comment => (
              <div key={comment.id} className="border-bottom py-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="fw-medium text-primary">{comment.user}</span>
                  <span className="text-muted small">{comment.timestamp}</span>
                </div>
                <p className="mb-0">{comment.text}</p>
              </div>
            ))}
          </div>
          
          <Form onSubmit={handleCommentSubmit}>
            <h3 className="h5 fw-medium mb-3">Add Your Analysis</h3>
            <Form.Group className="mb-3">
              <Form.Control 
                as="textarea"
                rows={3}
                placeholder="Share your expertise or evidence about this article's accuracy..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Form.Group>
            <Button type="submit" variant="primary">
              Submit Comment
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ArticleDetailPage;