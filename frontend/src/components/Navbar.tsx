import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Container, Nav, Button, Dropdown } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setExpanded(false);
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
              to="/dashboard" 
              active={isActive('/dashboard')}
              onClick={() => setExpanded(false)}
            >
              Markets
            </Nav.Link>
          </Nav>
          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                <span className="text-muted small me-2">
                  {user.provePoints} Points
                </span>
                <Dropdown>
                  <Dropdown.Toggle variant="outline-primary" size="sm">
                    {user.username}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/profile">
                      Profile
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (              <>
                <Link to="/login">
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={() => setExpanded(false)}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => setExpanded(false)}
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;