import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Search from './Search.jsx';
// import Header from './Header.jsx';
// import Home from './Home.jsx';
import About from './About.jsx';

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
      <About/>
    </>
  )
}

export default App;
