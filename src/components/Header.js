import logo from "../logo.png";
import { Button } from "@web3uikit/core";

function Header() {
  return (
    <nav className="navbar bg-white">
      <div className="container d-flex justify-content-between">
        <a class="navbar-brand" href="#">
          <img src={logo} alt="" width="100" height="100" />
        </a>

        <Button />
      </div>
    </nav>
  );
}

export default Header;
