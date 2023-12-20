import { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import {useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth';
import useRefreshToken from "../hooks/useRefreshToken";

import axios from '../api/axios';
const LOGIN_URL = '/api/v1/auth/login';

const LoginPage = () => {
const { setAuth } = useAuth();
const refresh = useRefreshToken();
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.form?.pathname || "/"
  const [uname, setuname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const userRef = useRef();
  const errRef = useRef();

    
    useEffect(() => {
    userRef.current.focus();
    const checkauth =async ()=>{
      const newAccessToken = await refresh();
      if(newAccessToken){
        navigate(from,{replace:true})}
      }
      checkauth();
    }, [])
    
    

    useEffect(() => {
        setError('');
    }, [uname, password])



  const handleLogin = async(e) => {
    e.preventDefault();
    try {
        const response = await axios.post(LOGIN_URL,
            JSON.stringify({ "username":uname, password }),
            {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            }
        );
        console.log(JSON.stringify(response?.data));
        //console.log(JSON.stringify(response));
        const accessToken = response?.data?.accessToken;
        setAuth({ uname, password, accessToken });
        setuname('');
        setPassword('');
        navigate(from,{replace:true});
    } catch (err) {
        if (!err?.response) {
            setError('No Server Response');
        } else if (err.response?.status === 400) {
            setError('Missing Username or Password');
        } else if (err.response?.status === 401) {
            setError('Unauthorized');
        } else {
            setError('Login Failed');
        }
        errRef.current.focus();
    }
  };

  return (
        <Container className='Login'>
        <Row className="justify-content-center align-items-center">
          <Col md={6} className='logindiv'>
            <h2 className="mt-3 mb-4 text-center">Login</h2>
  
            {error && <Alert ref={errRef} variant="danger">{error}</Alert>}
  
            <Form onSubmit={handleLogin}>
              <Form.Group controlId="username">
                <Form.Label>User Name</Form.Label>
                <Form.Control
                  type="text"
                  ref={userRef}
                  placeholder="Enter User Name"
                  value={uname}
                  onChange={(e) => setuname(e.target.value)}
                  required
                />
              </Form.Group>
  
              <Form.Group controlId="password" className='mt-3'>
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
  
              <Button variant="primary" type="submit" className='mt-3 mb-4'>
                Login
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    )
};

export default LoginPage;
