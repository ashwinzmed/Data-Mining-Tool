import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useRefreshToken from "../hooks/useRefreshToken";
import { useEffect, useState } from "react";


const RequireAuth= ()=>{
    const {auth} = useAuth();
    const location = useLocation();
    const refresh = useRefreshToken();
    const [login, setLogin] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const checkLogin = async () => {
          try {
            const token = await refresh();
            setLogin(token.length > 0);
          } catch (error) {
            console.error("Error checking login:", error);
            setLogin(false);
          } finally {
            setLoading(false); 
          }
        };
    
        checkLogin();
      }, []);
    
      if (loading) {
        return <div>Loading...</div>;
      }

    return(
        (auth?.accessToken || login) && auth?.accessToken != null 
        ? <Outlet/>
        : 
        <Navigate to="/login" state={{from:location}} replace />
    )
}

export default  RequireAuth