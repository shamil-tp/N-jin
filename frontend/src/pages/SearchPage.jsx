import "./SearchPage.css";

function Result({ icon, site, title, desc }) {
  return (
    <div className="result">
      <div className="url">
        <img className="site-icon" src={icon} alt="" />
        {site}
      </div>
      <a href="#">{title}</a>
      <div className="desc">{desc}</div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="search-page">
      <div className="top-bar">
        <div className="logo">G</div>
        <div className="search-box">
          <input type="text" defaultValue="malayalam movie" />
        </div>
      </div>

      <div className="results">
        <Result
          icon="https://img.icons8.com/color/48/ticket.png"
          site="bookmyshow.com"
          title="Latest Malayalam Movies 2026 | New Mollywood Movies"
          desc="Discover the latest Malayalam movies of 2026 and explore our best Mollywood movies list. Book tickets for exciting new releases."
        />

        <Result
          icon="https://img.icons8.com/color/48/video.png"
          site="dailymotion.com"
          title="Malayalam Movies Videos"
          desc="Malayalam movies channel, the place to watch all videos, playlists, and live streams by Malayalam movies on Dailymotion."
        />

        <Result
          icon="https://img.icons8.com/color/48/news.png"
          site="timesofindia.indiatimes.com"
          title="Latest Malayalam Movies | List of New Releases"
          desc="Latest Malayalam Movies: Aashaan, Prakambanam, Christina, Valathu Vashathe Kallan and more trending releases."
        />

        <Result
          icon="https://img.icons8.com/color/48/tv.png"
          site="hotstar.com"
          title="Watch New Malayalam Movies & TV Shows"
          desc="Stream the latest Malayalam movies, web series, and TV shows on Hotstar. Watch online now."
        />
      </div>
    </div>
  );
}
