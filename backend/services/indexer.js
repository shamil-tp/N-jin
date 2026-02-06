const Search = require("../models/Search");

async function saveSitesToDB(sites) {
  for (const site of sites) {
    try {
      await Search.findOneAndUpdate(
        { url: site.url },          // check by unique URL
        {
          ...site,
          indexedAt: new Date(),    // update timestamp
        },
        {
          upsert: true,             // insert if not exists
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log("Indexed:", site.url);
    } catch (err) {
      console.error("DB Error:", err.message);
    }
  }
}

module.exports = saveSitesToDB;
