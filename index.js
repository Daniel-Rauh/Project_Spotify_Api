const express = require('express')
const app = express()
const hbs = require('hbs')
hbs.handlebars === require('handlebars')
require('dotenv').config()
const SpotifyWebApi = require('spotify-web-api-node')
hbs.registerPartials(__dirname + '/views/partials', function (err) {});
hbs.localsAsTemplateData(app)
app.locals.artists = []
app.locals.albums = []
app.locals.tracks = []

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
});
// Retrieve an access token
spotifyApi
    .clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body['access_token']))
    .catch(error => console.log('Something went wrong when retrieving an access token', error));

app.use(express.static('public'))
app.set('view engine', 'hbs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.listen(3010, () => {
    console.log('Hey Listen!')
})

app.get('/', (req, res) => {
    res.status(200).render('index')
})
app.get('/artist-search', (req, res) => {
    spotifyApi
        .searchArtists(req.query.artist)
        .then(data => {
            app.locals.artists = data.body.artists.items;
            res.status(200).redirect('/artist-results')
        })
        .catch(err => console.log('The error while searching artists occurred: ', err));
})
app.get('/artist-results', (req, res) => {
    res.status(200).render('artistResult')
})
app.get('/albums/:id', (req, res) => {
    spotifyApi
        .getArtistAlbums(req.params.id, {album_type: 'album' })
        .then(data => {
            app.locals.albums = data.body.items
            res.status(200).render('artistAlbums')
        })
})
app.get('/album/:id', (req, res) => {
    spotifyApi
        .getAlbumTracks(req.params.id)
        .then(data => {
            console.log(data.body.items[0])
            app.locals.tracks = data.body.items
            res.status(200).render('tracks')
        })
})