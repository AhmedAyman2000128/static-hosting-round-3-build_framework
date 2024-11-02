import { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../images/logo.png";
function Upload() {
  const [zipfile, setzipfile] = useState<File | null>(null);
  const [buildCommand, setBuildCommand] = useState<string>("");
  const [siteName, setSiteName] = useState<string>("");
  const [urlRecieved, setUrlRecieved] = useState<string>("");
  const [isLoading,setIsLoading] = useState<boolean>(false);
  async function sendzipfile() {
    if (zipfile === null || buildCommand === "" || siteName === "") {
      alert("please complete information");
      return;
    }
    let dataToBeSent: FormData = new FormData();
    dataToBeSent.append("zipfile", zipfile);
    dataToBeSent.append("buildCommand", buildCommand);
    dataToBeSent.append("siteName", siteName);
    console.log(dataToBeSent);
    try {
      //api of the backend
      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: dataToBeSent,
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.containerUrl) {setUrlRecieved(data.containerUrl);setIsLoading(false);}
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
                accept=".zip"
                onChange={(event) => {
                  if (event.target.files && event.target.files.length > 0) {
                    setzipfile(event.target.files[0]);
                  }
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
            className={`bg-blue-700 rounded-xl p-4 ${isLoading ? 'bg-blue-800' : 'hover:bg-blue-500'}`} 
            onClick={() => {
              setIsLoading(true);
              sendzipfile();
            }}
            disabled={isLoading}
          >
            {!isLoading ? "Deploy" : "Deploying..."}
          </button>
        </div>
        {urlRecieved && (
          <a href={urlRecieved} className="text-center" target="_blank">
            {siteName + ".astroCloud.com"}
          </a>
        )}
      </div>
    </>
  );
}

export default Upload;
