import { useState } from 'react';
import { Container, Row, Col, Card, Button, ButtonGroup, ProgressBar } from 'react-bootstrap';

// Mock sources data
const mockSources = [
  {
    id: 1,
    name: "World Politics",
    logo: "https://via.placeholder.com/100",
    reliability: 82,
    articlesAnalyzed: 423,
    recentArticles: [
      { id: 101, title: "Global Leaders Meet to Discuss Climate Change Solutions", confidence: 78 },
      { id: 102, title: "Trade Negotiations Resume Between Major Economies", confidence: 85 },
      { id: 103, title: "UN Security Council Addresses Regional Conflict", confidence: 91 }
    ]
  },
  {
    id: 2,
    name: "Tech Insights",
    logo: "https://via.placeholder.com/100",
    reliability: 76,
    articlesAnalyzed: 312,
    recentArticles: [
      { id: 201, title: "Tech Company Claims Breakthrough in Quantum Computing", confidence: 65 },
      { id: 202, title: "New Smartphone Features Advanced AI Capabilities", confidence: 88 },
      { id: 203, title: "Major Security Flaw Discovered in Popular Software", confidence: 92 }
    ]
  },
  {
    id: 3,
    name: "Health Daily",
    logo: "https://via.placeholder.com/100",
    reliability: 89,
    articlesAnalyzed: 287,
    recentArticles: [
      { id: 301, title: "New Study Reveals Benefits of Regular Exercise", confidence: 92 },
      { id: 302, title: "Researchers Identify Potential Treatment for Rare Disease", confidence: 84 },
      { id: 303, title: "Guidelines Updated for Preventative Health Screenings", confidence: 95 }
    ]
  },
  {
    id: 4,
    name: "Financial Times",
    logo: "https://via.placeholder.com/100",
    reliability: 83,
    articlesAnalyzed: 546,
    recentArticles: [
      { id: 401, title: "Market Report Shows Unexpected Economic Growth", confidence: 88 },
      { id: 402, title: "Central Bank Announces Interest Rate Decision", confidence: 94 },
      { id: 403, title: "Major Merger Could Reshape Industry Landscape", confidence: 79 }
    ]
  },
  {
    id: 5,
    name: "Entertainment Today",
    logo: "https://via.placeholder.com/100",
    reliability: 61,
    articlesAnalyzed: 378,
    recentArticles: [
      { id: 501, title: "Celebrity Endorses Controversial Health Product", confidence: 35 },
      { id: 502, title: "Award Show Celebrates Industry Achievements", confidence: 89 },
      { id: 503, title: "Streaming Service Announces New Original Series", confidence: 76 }
    ]
  },
  {
    id: 6,
    name: "Science Weekly",
    logo: "https://via.placeholder.com/100",
    reliability: 93,
    articlesAnalyzed: 215,
    recentArticles: [
      { id: 601, title: "Researchers Develop New Renewable Energy Technology", confidence: 82 },
      { id: 602, title: "Study Examines Long-term Space Travel Effects", confidence: 88 },
      { id: 603, title: "New Species Discovered in Remote Region", confidence: 97 }
    ]
  }
];

const SourcesPage = () => {
  const [sortBy, setSortBy] = useState<'reliability' | 'name' | 'articles'>('reliability');
  const [selectedSource, setSelectedSource] = useState<number | null>(null);
  
  // Sort sources based on selected criterion
  const sortedSources = [...mockSources].sort((a, b) => {
    if (sortBy === 'reliability') {
      return b.reliability - a.reliability;
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return b.articlesAnalyzed - a.articlesAnalyzed;
    }
  });
  
  // Get the selected source details
  const sourceDetails = selectedSource !== null 
    ? mockSources.find(source => source.id === selectedSource)
    : null;
  
  // Function to get reliability variant for Bootstrap components
  const getReliabilityVariant = (reliability: number) => {
    if (reliability >= 80) {
      return 'success';
    } else if (reliability >= 65) {
      return 'warning';
    } else {
      return 'danger';
    }
  };

  return (
    <Container className="py-5">
      <Card className="bg-info bg-opacity-25 mb-5 shadow-soft text-center">
        <Card.Body className="p-5">
          <h1 className="display-5 fw-bold mb-4">News Source Transparency</h1>
          <p className="lead mx-auto" style={{ maxWidth: '800px' }}>
            Explore the reliability scores of various news sources based on our prediction market results. 
            Higher scores indicate sources whose articles are consistently verified as accurate.
          </p>
        </Card.Body>
      </Card>
      
      <Row className="g-4">
        {/* Sources List */}
        <Col md={6}>
          <Card className="shadow-soft h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h4 fw-bold">Sources</h2>
                <ButtonGroup size="sm">
                  <Button 
                    variant={sortBy === 'reliability' ? 'primary' : 'light'}
                    onClick={() => setSortBy('reliability')}
                  >
                    By Reliability
                  </Button>
                  <Button 
                    variant={sortBy === 'name' ? 'primary' : 'light'}
                    onClick={() => setSortBy('name')}
                  >
                    By Name
                  </Button>
                  <Button 
                    variant={sortBy === 'articles' ? 'primary' : 'light'}
                    onClick={() => setSortBy('articles')}
                  >
                    By Coverage
                  </Button>
                </ButtonGroup>
              </div>
              
              <div className="d-flex flex-column gap-3">
                {sortedSources.map(source => (
                  <Card 
                    key={source.id}
                    className={`border ${selectedSource === source.id ? 'border-primary' : ''}`}
                    onClick={() => setSelectedSource(source.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <div className="bg-secondary rounded-circle me-3" style={{ width: '40px', height: '40px' }}>
                            {/* Source logo would go here */}
                          </div>
                          <div>
                            <h5 className="mb-0 fw-medium">{source.name}</h5>
                            <small className="text-muted">{source.articlesAnalyzed} articles analyzed</small>
                          </div>
                        </div>
                        
                        <div className="d-flex align-items-center">
                          <div className="text-end me-2">
                            <div className="fw-medium">{source.reliability}%</div>
                            <small className="text-muted">reliability</small>
                          </div>
                          <ProgressBar
                            variant={getReliabilityVariant(source.reliability)}
                            now={100}
                            style={{ width: '8px', height: '48px' }}
                            className="m-0"
                          />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Source Details */}
        <Col md={6}>
          {sourceDetails ? (
            <Card className="shadow-soft h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <h2 className="h4 fw-bold">{sourceDetails.name}</h2>
                    <div className="text-muted">{sourceDetails.articlesAnalyzed} articles analyzed</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="display-6 fw-bold">{sourceDetails.reliability}%</div>
                    <div className="small text-muted">reliability score</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h5 className="mb-3">Reliability Over Time</h5>
                  <div className="bg-light rounded p-3 d-flex align-items-end justify-content-between" style={{ height: '160px' }}>
                    {/* This would be a chart in a real implementation */}
                    {Array.from({ length: 12 }).map((_, index) => {
                      const randomHeight = 30 + Math.random() * 50;
                      return (
                        <div 
                          key={index} 
                          className="bg-primary rounded-top" 
                          style={{ 
                            width: '16px', 
                            height: `${randomHeight}%` 
                          }} 
                        />
                      );
                    })}
                  </div>
                  <div className="text-center text-muted small mt-2">Last 12 months</div>
                </div>
                
                <div>
                  <h5 className="mb-3">Recent Articles</h5>
                  <div className="d-flex flex-column gap-2">
                    {sourceDetails.recentArticles.map(article => (
                      <Card key={article.id} className="bg-light">
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="small fw-medium">{article.title}</div>
                            <span className={`badge ${
                              article.confidence >= 80 
                                ? 'bg-success bg-opacity-10 text-success'
                                : article.confidence >= 50
                                  ? 'bg-warning bg-opacity-10 text-warning'
                                  : 'bg-danger bg-opacity-10 text-danger'
                            }`}>
                              {article.confidence}%
                            </span>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card.Body>
            </Card>
          ) : (
            <Card className="shadow-soft h-100">
              <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center p-5">
                <div className="display-1 mb-3">📰</div>
                <h3 className="h4 fw-medium mb-2">Select a Source</h3>
                <p className="text-muted">
                  Click on a news source from the list to view detailed reliability metrics and recent articles.
                </p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SourcesPage;