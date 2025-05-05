import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Container, Nav, Button } from 'react-bootstrap';

const Navbar = () => {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <BootstrapNavbar expanded={expanded} expand="sm" bg="light" className="shadow-soft mb-4">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold text-primary">Provn.io</BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle 
          aria-controls="basic-navbar-nav" 
          onClick={() => setExpanded(expanded ? false : true)}
        />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              active={isActive('/')}
              onClick={() => setExpanded(false)}
            >
              Home
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/sources" 
              active={isActive('/sources')}
              onClick={() => setExpanded(false)}
            >
              Sources
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/leaderboard" 
              active={isActive('/leaderboard')}
              onClick={() => setExpanded(false)}
            >
              Leaderboard
            </Nav.Link>
          </Nav>
          <Button variant="primary">Sign In</Button>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;