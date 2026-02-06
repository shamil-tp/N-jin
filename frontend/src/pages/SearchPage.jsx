import "./SearchPage.css";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function Result({ icon, site, title, desc }) {
  return (
    <div className="result">
      <div className="url">
        <img className="site-icon" src={icon} alt="" />
        {site}
      </div>
      <a href={site}>{title}</a>
      <div className="desc">{desc}</div>
    </div>
  );
}

export default function SearchPage() {
  const navigate = useNavigate
  const location = useLocation()
  const {results, query} = location.state
  console.log(results)

  function nav(){
    navigate('/')
  }
  return (
    <div className="search-page">
      <div className="top-bar">
        {/* <div className="logo" onClick={()=>{nav()}}>G</div> */}
        <Link to="/" className="logo" style={{textDecoration:'none'}}>G</Link>
        <div className="search-box">
          <input type="text" defaultValue={query} />
        </div>
      </div>

      <div className="results">
        {/* <Result
          icon="https://img.icons8.com/color/48/ticket.png"
          site="bookmyshow.com"
          title="Latest Malayalam Movies 2026 | New Mollywood Movies"
          desc="Discover the latest Malayalam movies of 2026 and explore our best Mollywood movies list. Book tickets for exciting new releases."
        /> */}
        {results.map((result)=>{
         return (
            <Result 
              icon="https://img.icons8.com/color/48/ticket.png"
              site={result.url}
              title={result.title}
              desc={result.content}
              key={result._id}
            />
          )
        })}

      </div>
    </div>
  );
}
