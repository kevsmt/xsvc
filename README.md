XAJAX Service
=============

What?
---

XAJAX Bundle for laravel 3


Installation
---

Add to `application/bundles.php`:

`'xsvc' => array('auto' => true)`

Goto https://github.com/Xajax/Xajax and (Important) download the `xajax_js` and place it in your `public/js` folder.


Usage
---

Controller:

    ...
    ...
  
    function svc_asked($str) 
    {
      $r = xsvc::response();
      $r->assign('inputresult', 'innerHTML', "You type: `{$str}`");
      return $r;
    }

    public function action_index()
    {
      // Initialize XSVC
      xsvc::initialize();
      xsvc::installPlugin('BufferText');
      xsvc::register(array(&$this, 'svc_asked'));
      // xsvc::registerAllMethods($this, 'svc_');
      xsvc::serve();

      return View::make('home.index');
    }


View:

    ...
    ...
  
    {{ xsvc::printJavascript()  }}
  
    <script type="text/javascript">
      var myBuffer = new xsvc.plugin.BufferText('askfield', 'value', 'svc_asked', 1700, true);
      myBuffer.addEvent('typing', function() { 
        $('#search-input-status').text("Typing...");
      });
      myBuffer.addEvent('donetyping', function() { 
        if ($('#askfield').val() == "") {
          $('#search-input-status').text("I'm waiting...");
        } else {
          $('#search-input-status').text("Ask more...");
        }
      });
      myBuffer.addEvent('request', function() { 
        $('#search-input-status').text("Please Wait...");
      });
      myBuffer.addEvent('requestcomplete', function() { 
        this.fireEvent('donetyping');
      });
    </script>
  
    <input type="text" id="askfield" onkeyup="myBuffer.check()" placeholder="So...what do you need to know?"/>
    <span id="search-input-status" class="input-group-addon">I'm waiting...</span>
  
    <div id="inputresult"></div>  
  
Other Usage in JS:
------------------

  xsvc.run('mycommandfromphp', [1,2,3,'arguments']);

Using it with forms:
--------------------

PHP:

    function processmysubmit($data) {
      $r = xsvc::response();
      $r->assign('formresult', 'innerHTML', json_encode($data));
      $r->alert("done!"); // xsvc::alert("done!");
      return $r;
    }

HTML:

    <form class="form-group" action="javascript::void(0);" 
          onsubmit="xsvc.processForm(this, 'processmysubmit'); return false;">
      <div class="form-group-fields">
        <input type="text" name="username" placeholder="Username" autofocus/>
        <input type="password" name="password" placeholder="Password"/>
      </div>
      <button class="btn btn-success btn-medium" type="submit">Submit</button>
    </form>

    <div id="formresult"></div>

PHP Static Class API:
----
- initialize()
- configure(string, mixed) // an alias of XAJAX configure
- configureMany(object) // an alias of XAJAX configureMany
- registerAllMethods(object, string) // registers all methods with a prefix
- register(mixed, string) // register a method, and the file to include on register
- printJavascript() // print outs xsvc scripts and plugins
- addScript(string) // javascript code to add, will be included on printJavascript()
- installPlugin(string) // xsvc plugin to install
- serve() // start serving methods to browser; xajax alias of processRequest
- response() // an alias of XAJAX <-- new xajaxResponse();
- alert(string) // an alias of XAJAX response()->alert("A")


JS Namespaced API:
----
xsvc.commandExists(command)
xsvc.run(command, parameters, additional configs)
xsvc.call(command, additional configs)
xsvc.processForm(form id/form object, command, additional configs)
xsvc.addEvent(event name, callback) // global event


Check if it worked:
-------------------

    http://mylocalhost/laravel/public/


Good Luck!
-----
