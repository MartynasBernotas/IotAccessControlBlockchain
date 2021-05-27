import express from "express";;
const app = express();
const port = 8888; // default port to listen

// define a route handler for the default home page
app.get( "/device1", ( req, res ) => {
    res.send( "17 Celsius" );
} );

app.get( "/device2", ( req, res ) => {
    res.send( "SMTH else" );
} );

// start the Express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
} );