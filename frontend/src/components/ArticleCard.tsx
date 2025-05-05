import { Link } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';

type ArticleCardProps = {
  id: number;
  title: string;
  source: string;
  excerpt: string;
  confidence: number;
  date: string;
  imageUrl?: string;
};

const ArticleCard = ({ id, title, source, excerpt, confidence, date, imageUrl }: ArticleCardProps) => {
  // Function to determine confidence level and appropriate styling
  const getConfidenceDisplay = () => {
    if (confidence >= 80) {
      return <span className="confidence-high">High Confidence</span>;
    } else if (confidence >= 50) {
      return <span className="confidence-medium">Medium Confidence</span>;
    } else {
      return <span className="confidence-low">Low Confidence</span>;
    }
  };

  return (
    <Card className="shadow-soft h-100 transition">
      {imageUrl && (
        <div className="overflow-hidden" style={{ height: '160px' }}>
          <Card.Img 
            variant="top" 
            src={imageUrl} 
            alt={title}
            className="h-100 object-fit-cover" 
          />
        </div>
      )}
      
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="text-secondary small fw-medium">{source}</span>
          <span className="text-muted smaller">{date}</span>
        </div>
        
        <Card.Title className="mb-2 flex-grow-1">{title}</Card.Title>
        
        <Card.Text className="text-secondary small mb-3 text-truncate-2">
          {excerpt}
        </Card.Text>
        
        <div className="d-flex align-items-center justify-content-between mt-auto">
          {getConfidenceDisplay()}
          <Button as={Link} to={`/article/${id}`} variant="outline-secondary" size="sm">
            View Details
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ArticleCard;