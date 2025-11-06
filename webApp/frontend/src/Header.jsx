import { Link } from "react-router-dom";
import { BsFileBarGraph } from "react-icons/bs";
import { IoMdHome } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { FcAbout } from "react-icons/fc";

const Header = () => {
  return (
    <header className="header">
      {/* Left side — Logo and Title */}
      <div className="title">
        <i><BsFileBarGraph /></i>
        <strong>Sentiment Scope</strong>
      </div>

      {/* Right side — Navigation Links */}
      <nav className="head">
        <Link to="/" className="nav">
          <i><IoMdHome size={20} /></i> Home
        </Link>
        <Link to="/search" className="nav">
          <i><CiSearch size={20} /></i> Search
        </Link>
        <Link to="/about" className="nav">
          <i><FcAbout size={20} /></i> About
        </Link>
      </nav>
    </header>
  );
};

export default Header;
