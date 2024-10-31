import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import logo from "../images/logo.png";
function Upload() {
  const [zipfile, setzipfile] = useState(null);
  const [buildCommand, setBuildCommand] = useState("");
  const [siteName, setSiteName] = useState("");
  const navigateToHome = useNavigate();

  async function sendzipfile() {
    if (zipfile === null || buildCommand === "" || siteName === "") {
      alert("please complete information");
      return;
    }
    let dataToBeSent = new FormData();
    dataToBeSent
      .append("zipfile", zipfile)
      .append("buildCommand", buildCommand)
      .append("siteName", siteName);

    try {
      //api of the backend
      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: dataToBeSent,
      });
      if (response.ok) {
        const data = await response.json();
        navigateToHome("/sitesdeployed", { url: { newurl: "u1" } });
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <>
      <NavLink to={"/"}>
        <img alt="" src={logo} width={150} />
      </NavLink>
      <div className="centering flex flex-col gap-4">
        <div className="text-center text-4xl">Zip File</div>
        <div className="bg-blue-950 p-4 rounded-md flex flex-col gap-4">
          <div className="p-3 border-2 border-white p-4 rounded-xl flex flex-col gap-3">
            <div className="p-3 border-2 border-white p-4 rounded-xl">
              <input
                type="file"
                accept=".zip" // only accept .zip zipfile
                onChange={(event) => {
                  setzipfile(event.target.files[0]); // single file, so use [0]
                }}
              />
            </div>
            <input
              className="w-full p-2 rounded-sm text-black focus:outline-none"
              type="text"
              placeholder="Build Command"
              onChange={(event) => {
                setBuildCommand(event.target.value);
              }}
            />
            <input
              className="w-full p-2 rounded-sm text-black focus:outline-none"
              type="text"
              placeholder="Site name"
              onChange={(event) => {
                setSiteName(event.target.value);
              }}
            />
          </div>
          <button
            className="bg-blue-700 rounded-xl p-4"
            onClick={() => {
              sendzipfile();
            }}
          >
            Deploy
          </button>
        </div>
      </div>
    </>
  );
}

export default Upload;
