# Comics React Server
A express app which serves the last and current weeks comic releases from a API and can obtain ther cover image for a comic from another API.

## Built With 
* Node
* Express
* Axios
* Passport

## Installation

Create a .env file with the following variables :
- COMIC_VINE_KEY - place your ComicVine api key here 
- MARVEL_KEY_LONG - place your marvel comic api private key here
- MARVLE KEY SHORT - place your marvel comic api public key here
- MONGOLINK - place your link to your mongo database here

```
$ npm install 
$ npm run serve
```
