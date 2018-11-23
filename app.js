var createError = require('http-errors');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var logger = require('morgan');
var mongoose = require('mongoose');
const moment = require('moment');
var expressGraphQL = require('express-graphql');
const jwt = require('express-jwt');

var User = require('./models/User');
var GraphQLSchema = require('./graphql');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

/**
 * Connect to MongoDB.
 */
mongoose.connect('mongodb://127.0.0.1:27017/friendr', {
    useMongoClient: true
});
mongoose.connection.on('error', function () {
    console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
    process.exit(1);
});
mongoose.set('debug', true);

/**
 * Express configuration.
 */
app.set('port', 3000);

app.use(logger('dev'));

app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 5000}));
app.use(bodyParser.json({limit: '50mb'}));

/**
 * GraphQL server
 */

 app.use('/graphql', jwt({
     secret: 'adfasdf',
     requestProperty: 'auth',
     credentialsRequired: false,
 }));

 // =========== GraphQL setting  ========== //
 app.use('/graphql', async (req, res, done) => {
     var userId = (req.auth && req.auth.id ) ? req.auth.id : undefined;
     const user = ( userId ) ? await User.findById(userId): undefined;
     req.context = {
         user: user,
     }
     done();
 });

 app.use('/graphql', expressGraphQL(req => ({
         schema: GraphQLSchema,
         context: req.context,
         graphiql: 'development',
     })
 ));
 // =========== GraphQL setting END ========== //

 /**
  * Start Express server.
  */
 app.listen(app.get('port'), function () {
     console.log('Express server listening on port %d', app.get('port'));
 });

module.exports = app;
