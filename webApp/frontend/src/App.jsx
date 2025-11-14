import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Search from './Search.jsx';
import Header from './Header.jsx';
import Home from './Home.jsx';
import About from './About.jsx';
import ResultsPage from './ResultsPage.jsx';
import Analysis from './Analysis.jsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage.jsx';
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
<<<<<<< HEAD
=======
import Profile from './Profile.jsx';
>>>>>>> 436d715e924c30401d893e9b9160443f2d9bc290

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <div>
        <h1>Hello world</h1>
        <button>Click here</button>
      </div> */}
      {/* <Header/> */}
      {/* <Search/> */}
      {/* <Home/> */}
      {/* <About/> */}
      <Router>
        {/* <Header/> */}
          <Routes>
              <Route path="/" element={<LandingPage/>}></Route>
              {/* <Route path="/" element={<Login/>}></Route> */}
              <Route path="/login" element={<Login/>}></Route>
              <Route path="/signup" element={<Signup/>}></Route>
              <Route path="/home" element={<Home/>}></Route>
              <Route path="/search" element={<Search/>}></Route>
              <Route path="/about" element={<About/>}></Route>
              <Route path="/result" element={<ResultsPage/>}></Route>
              <Route path="/analysis" element={<Analysis/>}></Route>
<<<<<<< HEAD
=======
              <Route path="/profile" element={<Profile />} />
>>>>>>> 436d715e924c30401d893e9b9160443f2d9bc290
          </Routes>
      </Router>
    </>
  )
}

export default App;
