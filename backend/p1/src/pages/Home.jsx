import { NavLink } from "react-router-dom";
import logo from "../images/logo.png";
function Home() {
  //const urlData = useLoaderData();
  return (
    <>
      <div className="absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-3/4 flex flex-col items-center justify-center">
        <div className="logoshadow"></div>
        <img alt="" src={logo} width={700} style={{ marginBottom: 30 }} />
        <NavLink to="/fileUpload">
          <button
            className="bg-primary p-4 text-4xl rounded-lg font-bold"
            style={{ color: "rgb(249 191 190)" }}
          >
            Deploy
          </button>
          {/* {urlData.length !== 0 && (
            <NavLink to="/sitesdeployed" style={{ marginLeft: 20 }}>
              <button
                className=" bg-primary p-4 text-4xl rounded-lg font-bold"
                style={{ color: "rgb(249 191 190)" }}
              >
                Links
              </button>
            </NavLink>
          )} */}
        </NavLink>
      </div>
    </>
  );
}

export default Home;
