const Search = require("../models/Search");

async function saveSitesToDB(sites) {
  try {
    // Create an array of currently live URLs
    
    const currentUrls = sites.map(site => site.url);

    //  Insert new sites or update existing ones
    
    for (const site of sites) {
      await Search.findOneAndUpdate(
        { url: site.url },  
         // Check document by unique URL

        {
          ...site,          
          indexedAt: new Date(),  
        },

        {
          upsert: true,      
          new: true,         // Return updated document
          setDefaultsOnInsert: true,
        }
      );

      console.log("Indexed:", site.url);
    }

    //  Remove old sites that are no longer live
   
    if (currentUrls.length > 0) {
      await Search.deleteMany({
        url: { $nin: currentUrls }
      });

      console.log("Old inactive sites removed");
    }

  } catch (err) {
    console.error("DB Error:", err.message);
  }
}

module.exports = saveSitesToDB;
