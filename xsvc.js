/* editor: SublimeText, Indention: 2, author: Kevin (khebs@live.com) */

/**
 * @singleton
 */
window.xsvc = {};
  
/**
 * Holds all commands generated from xajax
 * @type {Object}
 */
xsvc.commands = {};

/**
 * Holds plugins
 * @type {Object}
 */
xsvc.plugin = {};

/**
 * Holds all pushed events
 * @type {Object}
 */
xsvc._events = false;

/**
 * Allowed Event Names
 * @type {Array}
   */
xsvc._eventNames = ['onRequest', 'onResponseDelay', 'onExpiration', 'beforeResponseProcessing', 
                    'onFailure', 'onRedirect', 'onSuccess', 'onComplete'];

/**
 * Check if Command Exists
 * @param  {String} command Command name
 * @return {Boolean}
 */
xsvc.commandExists = function(command) {
  if (this.commands[command]) {
    return true;
  } else {
    return false;
  }
};

/**
 * Run Service Commands
 * @param  {String} command Command Name
 * @param  {Array}  params  Parameters
 * @param  {Object} config  Additional Configs
 * @return {Mixed}
 */
xsvc.run = function(command, params, config) {
  if (this.commandExists(command)) {
    return xajax.request({ 
      xjxfun: command
    }, xsvc.util.applyIf({ parameters: [].concat(params) }, config));
  } else {
    throw new Error('`' + command + '` is not defined.');
  }
};

/**
 * Call command with more control
 * @param  {String} command Command Name
 * @param  {Object} config  Object { parameter: [], context: {} }
 * @return {Mixed}
 */
xsvc.call = function(command, config) {
  if (this.commandExists(command)) {
    return xajax.request({ xjxfun: command }, config);
  } else {
    throw new Error('`' + command + '` is not defined.');
  }
};

/**
 * Add XAJAX Event Callbacks
 * @param {String}   eventName  Event Name
 * @param {Function} callback   Function to call on event fire
 * return {void}
 *
 * onRequest;
 * onResponseDelay;
 * onExpiration;
 * beforeResponseProcessing;
 * onFailure;
 * onRedirect;
 * onSuccess;
 * onComplete;
 */
xsvc.addEvent = function(eventName, callback) {
  // Since we dont have events yet we populate this.
  if (this._events === false) {
    this._events = {};
    for (var i = 0; i < this._eventNames.length; i++) {
      var name = this._eventNames[i];
      this._events[name] = new Array();
      xsvc.util.compile([
        'xajax.callback.global.', name, ' = function(){',
          'var e = xsvc._events["', name, '"];',
          'for(var i=0;i<e.length;i++){',
            'e[i].call();',
          '}',
        '};'
      ].join(''));
    }
  }

  if (this._eventNames.indexOf(eventName) != -1) {
    this._events[eventName].push(callback);
  } else {
    throw new Error(evetName + ' is not a XAJAX event.');
  }
};

/**
 * Service Util
 * @type {Object}
 */
xsvc.util = {

  /**
   * Compile Javascript without EVAL
   * @param  {String} code Javascript
   * @return {Mixed}
   */
  compile: function(code) {
    var result, 
        D = document,
        S = D.createElement('script'),
        H = D.head || D.getElementsByTagName['head'][0],
        param = Array.prototype.slice.call(arguments, 1);

    code = 'function evalWE(){' + code + '}';
    S.innerText === '' ? S.innerText=code : S.textContent = code;

    H.appendChild(S);
    result = evalWE.apply(this, param);
    H.removeChild(S);

    return result
  },

  /**
   * Creates a namespace object
   * usage: Namespace({object}/,'MyNamespace');
   *
   * @param {Arguments} The namespace arguments
   */
  ns: function() {
    // @private
    var args = arguments;
    var parent = window;

    var createNs = function(ns) {
      var aDomains = ns.split(".");
      var oDomain = parent;

      for (var i = 0; i < aDomains.length; i++) {
        var oSubDomain = aDomains[i];

        if (typeof oDomain[oSubDomain] === 'undefined') {
          oDomain[oSubDomain] = {};
        }

        oDomain = oDomain[oSubDomain];
      }
    };

    // check if first argument is an object, if its an object make it
    // as a parent for namespace. MyFirsArgument.[Namespaces.Namespaces.Namespaces]...
    for (var j = 0; j < args.length; j++) {
      if (j == 0) {
        if (typeof args[j] == "object") {
          parent = args[j];
          continue;
        }
      }
      createNs(args[j]);
    }
  },

  /**
   * apply
   * Copies all the properties of config to obj.
   *
   * @param {Object} o The properties to set to
   * @param {Object} c The source properties to copy
   * @param {Object} defaults The default properties if not in {@param o}
   * @return {Object} The applied objects
   */
  apply: function(o, c, defaults) {
    if (defaults) {
      xsvc.util.apply(o, defaults);
    }

    if (o && c && typeof c == 'object') {
      for (var p in c)
        o[p] = c[p];
    }

    return o;
  },

  /**
   * applyIf
   * Copies all the properties of config to obj if they don't already exist.
   *
   * @param {Object} o The properties to set to
   * @param {Object} c The source properties to copy
   * @return {Object} The applied objects
   */
  applyIf: function(o, c) {
    if (o) {
      for (var p in c) {
        if ((typeof o[p] == 'undefined'))
          o[p] = c[p];
      }
    }
    return o;
  }
};

/**
 * Holds true when loaded
 * @type {Boolean}
 */
xsvc.isLoaded = true;
