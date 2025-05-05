import { useState } from 'react';
import { Container, Row, Col, Card, Button, ButtonGroup } from 'react-bootstrap';
import ArticleCard from '../components/ArticleCard';

// Mock data for articles
const mockArticles = [
  {
    id: 1,
    title: "New Study Reveals Benefits of Regular Exercise",
    source: "Health Daily",
    excerpt: "Research conducted over a five-year period shows significant improvements in cardiovascular health for those who exercise at least 30 minutes daily.",
    confidence: 92,
    date: "May 5, 2025",
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: 2,
    title: "Global Leaders Meet to Discuss Climate Change Solutions",
    source: "World Politics",
    excerpt: "Representatives from 45 countries gathered to propose new policies addressing rising global temperatures and extreme weather events.",
    confidence: 78,
    date: "May 4, 2025",
    imageUrl: "https://images.unsplash.com/photo-1569049176129-24fe2c56ec92?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: 3,
    title: "Tech Company Claims Breakthrough in Quantum Computing",
    source: "Tech Insights",
    excerpt: "A major technology corporation has announced a quantum processor that could potentially solve problems current supercomputers cannot handle.",
    confidence: 65,
    date: "May 3, 2025",
    imageUrl: "https://images.unsplash.com/photo-1479920252409-6e3d8e8d4866?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: 4,
    title: "Market Report Shows Unexpected Economic Growth",
    source: "Financial Times",
    excerpt: "Quarterly economic indicators surpassed analysts' predictions, showing a 3.2% growth despite earlier concerns of a potential recession.",
    confidence: 88,
    date: "May 2, 2025",
    imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: 5,
    title: "Celebrity Endorses Controversial Health Product",
    source: "Entertainment Today",
    excerpt: "A popular celebrity's recent promotion of an unverified health supplement has drawn criticism from medical professionals.",
    confidence: 35,
    date: "May 1, 2025",
    imageUrl: "https://images.unsplash.com/photo-1629220608817-0802c373e110?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: 6,
    title: "Researchers Develop New Renewable Energy Technology",
    source: "Science Weekly",
    excerpt: "A team of scientists has created a more efficient solar panel that could drastically reduce the cost of renewable energy implementation.",
    confidence: 82,
    date: "April 30, 2025",
    imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80"
  }
];

const HomePage = () => {
  const [filter, setFilter] = useState('all');
  
  // Filter articles based on confidence level
  const filteredArticles = filter === 'all' 
    ? mockArticles 
    : filter === 'high' 
      ? mockArticles.filter(article => article.confidence >= 80)
      : filter === 'medium'
        ? mockArticles.filter(article => article.confidence >= 50 && article.confidence < 80)
        : mockArticles.filter(article => article.confidence < 50);

  return (
    <Container className="py-5">
      {/* Hero section */}
      <Card className="bg-primary bg-opacity-25 mb-5 shadow-soft">
        <Card.Body className="p-5">
          <h1 className="display-5 fw-bold mb-4">Truth Verification For News Media</h1>
          <p className="lead mb-4" style={{ maxWidth: '800px' }}>
            Our platform uses prediction markets to verify the truth of news articles. 
            Join the community to identify truthful content and earn karma points while 
            helping combat misinformation.
          </p>
          <Button variant="primary" size="lg">Get Started</Button>
        </Card.Body>
      </Card>
      
      {/* Filter controls */}
      <div className="mb-4">
        <ButtonGroup className="mb-4">
          <Button 
            variant={filter === 'all' ? 'primary' : 'light'}
            onClick={() => setFilter('all')}
          >
            All Articles
          </Button>
          <Button 
            variant={filter === 'high' ? 'success' : 'light'}
            onClick={() => setFilter('high')}
          >
            High Confidence
          </Button>
          <Button 
            variant={filter === 'medium' ? 'warning' : 'light'}
            onClick={() => setFilter('medium')}
          >
            Medium Confidence
          </Button>
          <Button 
            variant={filter === 'low' ? 'danger' : 'light'}
            onClick={() => setFilter('low')}
          >
            Low Confidence
          </Button>
        </ButtonGroup>
      </div>
      
      {/* Articles grid */}
      <Row className="g-4">
        {filteredArticles.map(article => (
          <Col key={article.id} md={6} lg={4}>
            <ArticleCard {...article} />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default HomePage;