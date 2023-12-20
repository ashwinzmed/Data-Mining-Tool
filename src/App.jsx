import LoginPage from './components/LoginPage'
import Home from './components/Home'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import { Route, Routes } from 'react-router-dom' 


function App() {

  return (
   <Routes>
    <Route path='/' element={<Layout/>}>
      <Route path='login' element={<LoginPage/>} /> 
      <Route element={<RequireAuth/>} >
      <Route path='/' element={<Home/>} />
      </Route>
    </Route>
   </Routes>
  )
}

export default App
