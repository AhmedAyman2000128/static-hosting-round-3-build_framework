import logo from "../images/logo.png";
import { NavLink } from "react-router-dom";
import { useLoaderData } from "react-router-dom";
function UrlsContainer() {
  const urlData = useLoaderData();
  return (
    <>
      <NavLink to={"/"}>
        <img alt="" src={logo} width={150} />
      </NavLink>
      <div className="flex flex-col gap-4 bg-blue-950 mt-2 centering p-5">
        {urlData.length !== 0 ? (
          <>
            {urlData.map((url, index) => {
              return (
                // this should be extracted into a separate component with props
                <p key={url} className="text-center pb-1">
                  <a href={"http://" + url.name + ".lvh.me"} target="_blank">
                    {index + 1}. {url.name + ".lvh.me"}
                  </a>
                </p>
              );
            })}
          </>
        ) : (
          <div className="text-center">No urls deployed</div>
        )}
      </div>
    </>
  );
}

export default UrlsContainer;
export const queryUrls = async () => {
  const data = await fetch("http://localhost:3000/list");
  const urls = await data.json();
  return urls;
};
