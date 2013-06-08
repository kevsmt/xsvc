<?php
/* editor: SublimeText, Indention: 2, author: Kevin (khebs@live.com) */

/**
 * Service Class -- kevs (:
 * @static
 */
class xsvc
{

  /** Holds scripts to append on printJS
   * @type array
   */
  protected static $scripts = array();

  /**
   * Holds all installed plugins
   * @var array
   */
  protected static $plugins = array();

  /**
   * Holds XAJAX instantiated class
   * @var object=>xajax
   */
  protected static $instance = null;

  /**
   * svc prefix
   * ! DO NOT CHANGE xsvc.js relies on this aswell
   * @type string
   */
  const prefix = 'xsvc.commands.';

  /**
   * Initialize xsvc
   * @return void
   */
  public static function initialize()
  {
    // Load XAJAX on demand only
    require_once Bundle::path('xsvc').'lib/xajax_core/xajax.inc.php';
    require_once Bundle::path('xsvc').'lib/xajax_core/xajaxCompress.inc.php';

    // Create new XAJAX instance
    self::$instance = new xajax();
    self::$instance->configure('wrapperPrefix', self::prefix);
    self::configureMany(Config::get('xsvc::settings'));
  }

  /**
   * Configure XAJAX
   * @param  string $key   Key
   * @param  mixed  $value Value
   * @return void
   */
  public static function configure($key, $value)
  {
    self::$instance->configure($key, $value);
  }

  /**
   * Pass on array of configs
   * @param  array $configs configuration array stack
   * @return void
   */
  public static function configureMany($configs)
  {
    self::$instance->configureMany($configs);
  }

  /**
   * Auto Register all methods with a prefix; default 'svc_'
   * @param  object $object       The Class Object
   * @param  string $prefix       Method Prefix
   * @return void
   */
  public static function registerAllMethods($object, $prefix = 'svc_')
  {
    if ($reflect = new ReflectionClass($object))
    {
      foreach ($reflect->getMethods() as $method)
      {
        if (substr($method->name, 0, strlen($prefix)) == $prefix
            && $reflect->name == $method->class)
        {
          self::register(array($object, $method->name));
        }
      }
    }
  }

  /**
   * Register function
   *
   * Examples:
   *
   *   $mFunction = array('alias', 'myClass', 'myMethod');
   *   $mFunction = array('alias', &$myObject, 'myMethod');
   *   $mFunction = array('myClass', 'myMethod');
   *   $mFunction = array(&$myObject, 'myMethod');
   *   $mFunction = 'myFunction';
   *
   * Note: might not be available in future versions of xajax (<=0.5)
   *
   * @param  string $mFunction    Function name
   * @param  const  $sType        XAJAX TYPE
   * @param  string $sIncludeFile The server path to the PHP file to
   *                              include when calling this function.
   * @return mixed
   */
  public static function register($mFunction, $stype = XAJAX_FUNCTION, $sIncludeFile = null)
  {
    $xuf = new xajaxUserFunction($mFunction, $sIncludeFile);
    return self::$instance->register($stype, $xuf);
  }

  /**
   * Prints Javascripts
   * @return void
   */
  public static function printJavascript()
  {
    if (!self::$instance) throw new Exception('xsvc is not initialized.');

    // Print our javascripts
    ob_start();
    echo '<script type="text/javascript">';
    echo xajaxCompressFile(File::get(Bundle::path('xsvc').'xsvc.js'));
    echo '</script>';
    // echo xajax scripts
    self::$instance->printJavascript();
    // run plugins and other scripts
    echo '<script type="text/javascript">';
    foreach (self::$plugins as $plugin) echo xajaxCompressFile(File::get($plugin));
    foreach (self::$scripts as $script) echo $script;
    echo '</script>';
    echo ob_get_clean();
  }

  /**
   * Add Script
   * @param string $script Javascript
   */
  public static function addScript($script)
  {
    $script = trim($script);
    if ( ! empty($script))
    {
      self::$scripts[] = xajaxCompressFile($script);
    }
  }

  /**
   * Install Plugin
   * @param  [type] $file [description]
   * @return [type]       [description]
   */
  public static function installPlugin($file)
  {
    $file = Bundle::path('xsvc')."plugins/{$file}.js";
    if (file_exists($file) || file_exists(__DIR__.'/'.$file))
    {
      self::$plugins[] = $file;
    }
  }

  /**
   * Start XJAX process requests
   * @return void
   */
  public static function serve()
  {
    self::$instance->processRequest();
  }

  /**
   * Create and returns xajaxResponse class
   * @return object=>xajaxResponse
   */
  public static function response()
  {
    return new xajaxResponse();
  }

  /**
   * XAjax Alert
   * @param  string $msg Message to alert
   * @return object=>xajaxResponse
   */
  public static function alert($msg)
  {
    $r = self::response()->alert($msg);
    return $r;
  }

  /**
   * Register all method in Laravel Task
   * @param   string  $task
   * @param   string  $bundle
   * @return  void
   */
  public static function registerAllTaskMethod($task, $bundle = 'application')
  {
    $taskIns = Command::resolve($bundle, $task);

    if ($taskIns)
    {
      if ($reflect = new ReflectionClass($taskIns))
      {
        foreach ($reflect->getMethods() as $method)
        {
          self::$instance->register(XAJAX_FUNCTION, array($taskIns, $method->name));
        }
      }
    }
  }

  /**
   * Register Laravel Task
   * @param   string  $task
   * @param   string  $method
   * @param   string  $bundle
   * @return  void
   */
  public static function registerTask($task, $method, $bundle = 'application')
  {
    $taskIns = Command::resolve($bundle, $task);

    if ($taskIns)
    {
      $alias = ($bundle == 'application' ? '' : $bundle . '_' ) . $task . '_' . $method;
      self::$instance->register(XAJAX_FUNCTION, array($taskIns, $method));
    }
  }
}
