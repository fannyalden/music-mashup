const request = require("request");

const options = { 
    headers: {
        'User-Agent': 'music-mashup/1.0.0 ( fnny_512@hotmail.com )'
    }
};

let mbPromise = id => {
    return new Promise((resolve, reject)=>{
        request('http://musicbrainz.org/ws/2/artist/'+id+'?&fmt=json&inc=url-rels+release-groups', options, (error, res, body) => {
            if(error)   return reject(err, response, body);
            resolve(JSON.parse(body));
        })
    })
}

let wikiPromise = artist => {
    return new Promise((resolve, reject) =>{
        request("https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&redirects=true&titles="+artist+"_(band)", options, (error, res, body) => {
            if(error)   return reject(err, response, body);
            const number = Object.keys(JSON.parse(body).query.pages);
            resolve(JSON.parse(body).query.pages[number].extract);
        });
    });
}

let coverartPromise = album => {
    return new Promise((resolve, reject) =>{
        request("http://coverartarchive.org/release-group/"+album.id, options, (error, res, body) => {
            if(error)   return reject(err, response, body);
            try {
                const data = JSON.parse(body);
                resolve({
                    title: album.title,
                    id: album.id,
                    coverart: data.images["0"].image
                })
            } catch(err) {
                //image doesn't exist on coverart
                resolve({
                    title: album.title,
                    id: album.id,
                    coverart: "image missing"
                })
            } 
        });
    })   
}

async function getArtist(id) {

    const artist = await mbPromise(id);  
    const artistWiki = await wikiPromise(artist.name);
    const promisesArray = artist['release-groups'].map(album =>{
        return coverartPromise(album)
    })

    Promise.all(promisesArray).then(albums => {
        const obj = {
            Name: artist.name,
            Id: id,
            Description: artistWiki,
            Albums: albums
        }
        console.log(obj)
    }).catch(error => console.log(error.message)) 
}

//call function
getArtist("5b11f4ce-a62d-471e-81fc-a69a8278c7da") //Nirvanas mbid


 