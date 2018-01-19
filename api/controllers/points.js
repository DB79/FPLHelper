'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
var util = require('util');
const request = require('request');
const async = require('async');

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */
module.exports = {
  teamPoints: teamPoints,
  multipleTeamPoints: multipleTeamPoints
};

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function teamPoints(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var teamID = req.swagger.params.teamID.value;
  var gw = req.swagger.params.gameweek.value;

  GetTeamPoints(teamID, gw, function (result) {
    // this sends back a JSON response which is a single string
    res.json(result);
  });
}

function multipleTeamPoints(req, res) {
  var teamIds = req.swagger.params.teamId.value;
  var gw = req.swagger.params.gameweek.value;
  var totalScore = 0;
  
  // first is captain so add a second time
  teamIds.unshift(teamIds[0]);

  async.forEach(teamIds, function (teamId, callback) {
    GetTeamPoints(teamId, gw, function (score, error) {
      if (error) callback(error);
            
      totalScore += score;
      callback();
    })
  }, function (error) {
    if (error) console.log(error);
    res.json(totalScore)
  });
}

function GetTeamPoints(teamID, gw, callback) {

  let uri = 'https://fantasy.premierleague.com/drf/entry/' + teamID + '/event/' + gw + '/picks';

  request(uri, function (error, response, body) {
    if (error) callback("", error);

    let details = JSON.parse(body);
    let score = details.entry_history.points - details.entry_history.event_transfers_cost
    callback(score);
  })
}

