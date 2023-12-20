import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthProvider";
import useAxiosPrivate from "../hooks/useAxiosPrivate";


function TopNavbar(){
    const { setAuth } = useContext(AuthContext);
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();
    const handelSignout=async ()=>{
      setAuth({});
      try{
        await axiosPrivate.post('/api/v1/auth/logout', {});
      }catch(err){
        console.error(err);
      }
      navigate('/login');
    }
    
    return(
        <Navbar className=" shadow p-3 mb-5" style={{"background-color":"#24283A"}} >
        <Container>
          <Navbar.Brand href="/" style={{"color":"white"}}>
            <h1>zMed Data Mining Tool</h1>
          </Navbar.Brand>
          <div className='float-right text-white' onClick={handelSignout} style={{"cursor": "pointer"}}>
                <a>Sign Out</a>
            </div>
        </Container>
      </Navbar>
    )
}

export default TopNavbar