import { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, ButtonGroup } from 'react-bootstrap';

// Mock users data
const mockUsers = [
  {
    id: 1,
    username: "TruthSeeker",
    avatar: "https://i.pravatar.cc/150?img=1",
    karma: 8742,
    accuracy: 94,
    articlesVoted: 215,
    joinDate: "Jan 2024",
    badges: ["Top Predictor", "Consistency King", "Early Adopter"],
    recentActivity: [
      { articleId: 101, articleTitle: "Global Leaders Meet to Discuss Climate Change Solutions", vote: "true", outcome: "correct" },
      { articleId: 203, articleTitle: "Major Security Flaw Discovered in Popular Software", vote: "true", outcome: "correct" },
      { articleId: 304, articleTitle: "Study Links Diet to Improved Mental Health", vote: "false", outcome: "correct" }
    ]
  },
  {
    id: 2,
    username: "FactChecker",
    avatar: "https://i.pravatar.cc/150?img=2",
    karma: 7651,
    accuracy: 92,
    articlesVoted: 183,
    joinDate: "Feb 2024",
    badges: ["Expert Analyst", "Fast Responder"],
    recentActivity: [
      { articleId: 402, articleTitle: "Central Bank Announces Interest Rate Decision", vote: "true", outcome: "correct" },
      { articleId: 305, articleTitle: "New Treatment Shows Promise in Clinical Trials", vote: "true", outcome: "correct" },
      { articleId: 501, articleTitle: "Celebrity Endorses Controversial Health Product", vote: "false", outcome: "correct" }
    ]
  },
  {
    id: 3,
    username: "MediaWatcher",
    avatar: "https://i.pravatar.cc/150?img=3",
    karma: 6834,
    accuracy: 89,
    articlesVoted: 264,
    joinDate: "Dec 2023",
    badges: ["Volume Leader", "Politics Expert"],
    recentActivity: [
      { articleId: 103, articleTitle: "UN Security Council Addresses Regional Conflict", vote: "true", outcome: "correct" },
      { articleId: 201, articleTitle: "Tech Company Claims Breakthrough in Quantum Computing", vote: "true", outcome: "incorrect" },
      { articleId: 403, articleTitle: "Major Merger Could Reshape Industry Landscape", vote: "true", outcome: "correct" }
    ]
  },
  {
    id: 4,
    username: "DataDrivenThinker",
    avatar: "https://i.pravatar.cc/150?img=4",
    karma: 5923,
    accuracy: 88,
    articlesVoted: 192,
    joinDate: "Mar 2024",
    badges: ["Science Expert", "Data Specialist"],
    recentActivity: [
      { articleId: 601, articleTitle: "Researchers Develop New Renewable Energy Technology", vote: "true", outcome: "correct" },
      { articleId: 302, articleTitle: "Researchers Identify Potential Treatment for Rare Disease", vote: "true", outcome: "correct" },
      { articleId: 602, articleTitle: "Study Examines Long-term Space Travel Effects", vote: "false", outcome: "incorrect" }
    ]
  },
  {
    id: 5,
    username: "JournalismPro",
    avatar: "https://i.pravatar.cc/150?img=5",
    karma: 5411,
    accuracy: 85,
    articlesVoted: 178,
    joinDate: "Feb 2024",
    badges: ["Economy Expert", "Rising Star"],
    recentActivity: [
      { articleId: 401, articleTitle: "Market Report Shows Unexpected Economic Growth", vote: "true", outcome: "correct" },
      { articleId: 102, articleTitle: "Trade Negotiations Resume Between Major Economies", vote: "true", outcome: "correct" },
      { articleId: 503, articleTitle: "Streaming Service Announces New Original Series", vote: "true", outcome: "correct" }
    ]
  },
  {
    id: 6,
    username: "TruthDetector",
    avatar: "https://i.pravatar.cc/150?img=6",
    karma: 4982,
    accuracy: 84,
    articlesVoted: 156,
    joinDate: "Apr 2024",
    badges: ["Tech Expert", "Quick Responder"],
    recentActivity: [
      { articleId: 202, articleTitle: "New Smartphone Features Advanced AI Capabilities", vote: "true", outcome: "correct" },
      { articleId: 502, articleTitle: "Award Show Celebrates Industry Achievements", vote: "true", outcome: "correct" },
      { articleId: 301, articleTitle: "New Study Reveals Benefits of Regular Exercise", vote: "false", outcome: "incorrect" }
    ]
  },
  {
    id: 7,
    username: "NewsAnalyst",
    avatar: "https://i.pravatar.cc/150?img=7",
    karma: 4503,
    accuracy: 82,
    articlesVoted: 143,
    joinDate: "Mar 2024",
    badges: ["Health Expert"],
    recentActivity: [
      { articleId: 303, articleTitle: "Guidelines Updated for Preventative Health Screenings", vote: "true", outcome: "correct" },
      { articleId: 603, articleTitle: "New Species Discovered in Remote Region", vote: "true", outcome: "correct" },
      { articleId: 402, articleTitle: "Central Bank Announces Interest Rate Decision", vote: "false", outcome: "incorrect" }
    ]
  },
  {
    id: 8,
    username: "ReliableSource",
    avatar: "https://i.pravatar.cc/150?img=8",
    karma: 4127,
    accuracy: 81,
    articlesVoted: 132,
    joinDate: "Jan 2024",
    badges: ["Entertainment Expert"],
    recentActivity: [
      { articleId: 502, articleTitle: "Award Show Celebrates Industry Achievements", vote: "true", outcome: "correct" },
      { articleId: 503, articleTitle: "Streaming Service Announces New Original Series", vote: "true", outcome: "correct" },
      { articleId: 501, articleTitle: "Celebrity Endorses Controversial Health Product", vote: "false", outcome: "correct" }
    ]
  }
];

const LeaderboardPage = () => {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [timeFrame, setTimeFrame] = useState<'allTime' | 'month' | 'week'>('allTime');
  
  // Get the selected user details
  const userDetails = selectedUser !== null
    ? mockUsers.find(user => user.id === selectedUser)
    : null;
  
  return (
    <Container className="py-5">
      {/* Hero section */}
      <Card className="bg-info bg-opacity-10 mb-5 text-center shadow-soft">
        <Card.Body className="p-5">
          <h1 className="display-5 fw-bold mb-4">Truth Prediction Leaderboard</h1>
          <p className="lead mb-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
            Our top contributors with the highest karma points and accuracy rates in predicting truthful content. 
            Join the community to earn karma and climb the leaderboard!
          </p>
          <Button variant="primary" size="lg">Join Now</Button>
        </Card.Body>
      </Card>
      
      {/* Time frame selector */}
      <div className="text-center mb-4">
        <ButtonGroup className="mb-4">
          <Button 
            variant={timeFrame === 'allTime' ? 'primary' : 'light'}
            onClick={() => setTimeFrame('allTime')}
          >
            All Time
          </Button>
          <Button 
            variant={timeFrame === 'month' ? 'primary' : 'light'}
            onClick={() => setTimeFrame('month')}
          >
            This Month
          </Button>
          <Button 
            variant={timeFrame === 'week' ? 'primary' : 'light'}
            onClick={() => setTimeFrame('week')}
          >
            This Week
          </Button>
        </ButtonGroup>
      </div>
      
      <Row className="g-4">
        {/* Leaderboard table */}
        <Col lg={8}>
          <Card className="shadow-soft h-100">
            <Card.Body className="p-0">
              <Table hover responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Karma</th>
                    <th className="p-3">Accuracy</th>
                    <th className="p-3">Articles</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map((user, index) => (
                    <tr 
                      key={user.id} 
                      className={selectedUser === user.id ? 'table-primary' : ''}
                      onClick={() => setSelectedUser(user.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="p-3">
                        {index === 0 ? (
                          <span className="d-flex align-items-center justify-content-center bg-warning text-white rounded-circle" style={{ width: '32px', height: '32px', fontWeight: 'bold' }}>1</span>
                        ) : index === 1 ? (
                          <span className="d-flex align-items-center justify-content-center bg-secondary text-white rounded-circle" style={{ width: '32px', height: '32px', fontWeight: 'bold' }}>2</span>
                        ) : index === 2 ? (
                          <span className="d-flex align-items-center justify-content-center bg-danger text-white rounded-circle" style={{ width: '32px', height: '32px', fontWeight: 'bold' }}>3</span>
                        ) : (
                          <span className="text-muted fw-medium">{index + 1}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="d-flex align-items-center">
                          <div className="rounded-circle overflow-hidden me-3" style={{ width: '40px', height: '40px' }}>
                            <img src={user.avatar} alt={user.username} className="w-100 h-100" />
                          </div>
                          <div>
                            <div className="fw-medium">{user.username}</div>
                            <div className="small text-muted">Joined {user.joinDate}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 fw-medium">{user.karma}</td>
                      <td className="p-3">
                        <Badge 
                          bg={user.accuracy >= 90 ? 'success' : user.accuracy >= 80 ? 'warning' : 'danger'}
                          className="bg-opacity-75"
                        >
                          {user.accuracy}%
                        </Badge>
                      </td>
                      <td className="p-3 text-muted">{user.articlesVoted}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        {/* User details */}
        <Col lg={4}>
          {userDetails ? (
            <Card className="shadow-soft h-100">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <div className="rounded-circle overflow-hidden mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                    <img src={userDetails.avatar} alt={userDetails.username} className="w-100 h-100" />
                  </div>
                  <h2 className="h4 fw-bold">{userDetails.username}</h2>
                  <div className="text-muted">Joined {userDetails.joinDate}</div>
                </div>
                
                <Row className="g-3 mb-4">
                  <Col xs={4}>
                    <div className="text-center bg-success bg-opacity-10 rounded p-2">
                      <div className="fw-bold h4 mb-0">{userDetails.karma}</div>
                      <div className="small text-muted">Karma</div>
                    </div>
                  </Col>
                  <Col xs={4}>
                    <div className="text-center bg-primary bg-opacity-10 rounded p-2">
                      <div className="fw-bold h4 mb-0">{userDetails.accuracy}%</div>
                      <div className="small text-muted">Accuracy</div>
                    </div>
                  </Col>
                  <Col xs={4}>
                    <div className="text-center bg-warning bg-opacity-10 rounded p-2">
                      <div className="fw-bold h4 mb-0">{userDetails.articlesVoted}</div>
                      <div className="small text-muted">Articles</div>
                    </div>
                  </Col>
                </Row>
                
                <div className="mb-4">
                  <h3 className="h5 fw-medium mb-2">Badges</h3>
                  <div className="d-flex flex-wrap gap-2">
                    {userDetails.badges.map((badge, index) => (
                      <Badge 
                        key={index} 
                        bg="info"
                        className="bg-opacity-25 text-info"
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="h5 fw-medium mb-3">Recent Activity</h3>
                  <div className="d-flex flex-column gap-2">
                    {userDetails.recentActivity.map((activity, index) => (
                      <Card key={index} className="bg-light border-0">
                        <Card.Body className="p-3">
                          <div className="small fw-medium mb-1">{activity.articleTitle}</div>
                          <div className="d-flex justify-content-between small">
                            <span>
                              Voted: <span className={`text-${activity.vote === 'true' ? 'success' : 'danger'}`}>
                                {activity.vote === 'true' ? 'Accurate' : 'Inaccurate'}
                              </span>
                            </span>
                            <span>
                              Outcome: <span className={`text-${activity.outcome === 'correct' ? 'success' : 'danger'}`}>
                                {activity.outcome === 'correct' ? 'Correct' : 'Incorrect'}
                              </span>
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
                <div className="display-1 mb-3">🏆</div>
                <h3 className="h4 fw-medium mb-2">Select a User</h3>
                <p className="text-muted">
                  Click on a user from the leaderboard to view their detailed stats and recent prediction activity.
                </p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default LeaderboardPage;