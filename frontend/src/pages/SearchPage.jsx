import "./SearchPage.css";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../utils/axios";



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
  const navigate = useNavigate();
  const location = useLocation();

  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    const pageParam = params.get("page") || 1;
    const limitParam = params.get("limit") || 10;

    if (!q) return;

    setQuery(q);
    setPage(Number(pageParam));

    const fetchResults = async () => {
      try {
        const res = await api.get(
          `/search?q=${q}&page=${pageParam}&limit=${limitParam}`
        );


        setResults(res.data.results);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error(err);
      }
    };

    fetchResults();
  }, [location.search]);


  const handleNext = () => {
    if (page < totalPages) {
      navigate(`/search?q=${query}&page=${page + 1}&limit=10`);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      navigate(`/search?q=${query}&page=${page - 1}&limit=10`);
    }
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      navigate(`/search?q=${query}&page=1&limit=10`);
    }
  };


  function nav() {
    navigate('/')
  }
  return (
    <div className="search-page">
      <div className="top-bar">
        {/* <div className="logo" onClick={()=>{nav()}}>G</div> */}
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>G</Link>
        <div className="search-box">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleSearch} />
        </div>
      </div>

      <div className="results">
        {/* <Result
          icon="https://img.icons8.com/color/48/ticket.png"
          site="bookmyshow.com"
          title="Latest Malayalam Movies 2026 | New Mollywood Movies"
          desc="Discover the latest Malayalam movies of 2026 and explore our best Mollywood movies list. Book tickets for exciting new releases."
        /> */}
        {results.map((result) => {
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

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={handlePrev} disabled={page === 1}>
            &lt;
          </button>

          <span>Page {page} of {totalPages}</span>

          <button onClick={handleNext} disabled={page === totalPages}>
            &gt;
          </button>
        </div>
      )}

    </div>
  );
}
