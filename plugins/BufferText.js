/* editor: SublimeText, Indention: 2, author: Kevin (khebs@live.com) */

/**
  Usage:

  PHP:

  xsvc::installPlugin('BufferText');

  function checkvalue($str) {
    $r = xsvc::response();
    $r->assign('inputresult', 'innerHTML', "You type: `{$str}`");
    return $r;
  };

  xsvc::register('checkvalue');

  HTML/JAVASCRIPT:

  <script>
    var myBuffer = new xsvc.plugin.BufferText('myinput', 'value', 'checkvalue', 700);
    myBuffer.addEvent('typing', function() { console.log('Typing...'); });
    myBuffer.addEvent('typing.done', function() { console.log('Done Typing...'); });
  </script>
  <input id="myinput" onkeyup="myBuffer.check()"/>

*/

/**
 * BufferText Class
 * @author Kevs (khebs@live.com)
 * @param {String}  scopeid         Object id
 * @param {String}  property        Object property to get value/text
 * @param {String}  method          Server Method
 * @param {Integer} delay           Timer before trigger (defaults to 700ms)
 * @param {Boolean} searchOnReturn  triggers check on `enter`
 */
xsvc.plugin.BufferText = function(scopeid, property, method, delay, searchOnReturn) {
  var bufferText = false, timer = false, status = "", events = {}, self = this;

  // Check if we have a proper delay value
  delay = ((typeof delay != 'undefined') ? delay : 700);

  // Check for Search on Return
  if (((typeof searchOnReturn != 'undefined') ? searchOnReturn : false) === true) {
    window.addEventListener('load', function() {
      xjx.$(scopeid).addEventListener('keydown', function(e) {
        if (e.keyCode === 13) self.check(true);
      });
    });
  }


  /**
   * Text Compare
   * @param  {String} newText  New Text
   * @param  {String} property object property to get the value to compare
   * @return {Void}
   */
  var compareBuffer = function(newText) {
    // We compare because this `check` will also trigger on focus..
    // make request only if we are absolutely sure its not the same value
    // from the `bufferText`
    if (newText == xjx.$(scopeid)[property] && newText != bufferText) {
      bufferText = newText;
      makeRequest(xjx.$(scopeid)[property]);
    }
  };

  /**
   * Request to server
   * @param  {String} value The value to process
   * @return {Void}
   */
  var makeRequest = function(value) {
    if (xsvc.commandExists(method) && value.trim().length > 0) {
      xsvc.call(method, {
        parameters: [value],
        context: { scope: xjx.$(scopeid) },
        onRequest: function() {
          self.fireEvent('request');
        },
        onComplete: function() {
          self.fireEvent('requestcomplete');
        },
        onFailure: function() {
          self.fireEvent('requestfailed')
        }
      });
    } else {
      self.fireEvent('requestcomplete');
    }
  };

  /**
   * Add Event
   * @param {String}   name     Event Name
   * @param {Function} callback Event Callback
   */
  this.addEvent = function(name, callback) {
    if (!events[name]) events[name] = [];
    events[name].push(callback);
  };

  /**
   * Fire Event
   * @param  {String} name Event Name to Fire
   * @return {Void}
   */
  this.fireEvent = function(name) {
    if (events[name]) {
      for(var i in events[name]) {
        events[name][i].call(self);
      }
    }
  };

  /**
   * Force Request
   * This is usefull on Enter/Return key maybe?
   * @return {Void}
   */
  this.forceRequest = function() {
    if (!bufferText || bufferText != '') {
      makeRequest(xjx.$(scopeid)[property]);
    }
  };

  /**
   * Check
   * @return {Void}
   */
  this.check = function(__force) {
    var v = String(xjx.$(scopeid)[property]).trim();
    if (v != bufferText) {
      if (timer) {
        self.fireEvent('typing');
        clearTimeout(timer);
      }
      if (__force === true) {
        self.fireEvent('donetyping');
        setTimeout(function() {
          compareBuffer(v, property);
        }, 10);
      } else {
        timer = setTimeout(function(){
          self.fireEvent('donetyping');
          setTimeout(function() {
            compareBuffer(v, property);
          }, 10);
        }, delay);
      }
    }
  };

};
