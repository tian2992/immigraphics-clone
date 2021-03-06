(function(exports){

  var config = {
    /* List all the roles */
    roles: [
      'public',
      'user',
      'admin'],

    /* Access levels */
    accessLevels: {
      'public':   "*",
      'anon':     ['public'],
      'user' :    ['user', 'admin'],
      'admin':    ['admin']
    }
  }

  exports.userRoles = buildRoles(config.roles);
  exports.accessLevels = buildAccessLevels(config.accessLevels, exports.userRoles);

  /*
   * Method to build a distinct bit mask for each role
   * It starts off with "1" and shifts the bit to the left for each element in the
   * roles array parameter
   */

  function buildRoles(roles){

    var bitMask = "01";
    var userRoles = {};

    for(var role in roles){
      var intCode = parseInt(bitMask, 2);
      userRoles[roles[role]] = {
        bitMask: intCode,
        title: roles[role]
      };
      bitMask = (intCode << 1 ).toString(2)
    }

    return userRoles;
  }

  /*
   * This method builds access level bit masks based on the accessLevelDeclaration parameter which must
   * contain an array for each access level containing the allowed user roles.
   */
  function buildAccessLevels(accessLevelDeclarations, userRoles){

    var accessLevels = {};
    for(var level in accessLevelDeclarations){

      if(typeof accessLevelDeclarations[level] == 'string'){
        if(accessLevelDeclarations[level] == '*'){
          var resultBitMask = '';

          for( var role in userRoles){
            resultBitMask += "1"
          }

          accessLevels[level] = {
            bitMask: parseInt(resultBitMask, 2),
            title: accessLevelDeclarations[level]
          };
        } else
          console.log("Access Control Error: Could not parse '" + accessLevelDeclarations[level] + "' as access definition for level '" + level + "'")

      } else {

        var resultBitMask = 0;
        for(var role in accessLevelDeclarations[level]){
          if(userRoles.hasOwnProperty(accessLevelDeclarations[level][role]))
            resultBitMask = resultBitMask | userRoles[accessLevelDeclarations[level][role]].bitMask
          else
            console.log("Access Control Error: Could not find role '" + accessLevelDeclarations[level][role] + "' in registered roles while building access for '" + level + "'")
        }
        accessLevels[level] = {
          bitMask: resultBitMask,
          title: accessLevelDeclarations[level][role]
        };
      }
    }

    return accessLevels;
  }

})(typeof exports === 'undefined' ? this['routingConfig'] = {} : exports);
