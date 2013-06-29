where
=====

Where To Recycle App

This is an app to show people in the city of Albuquerque where they can go to recycle different materials.

In order to deploy the app, you must load the `locations` table dump file in the main project directory into a MySQL database.

Then, create a constants.php file in the /common/ folder that looks like this:

<?php
define('DB_HOST', 'your.mysql.domain.or.ip.com');
define('DB_USER', 'your-db-user');
define('DB_PASS', 'your-db-pass');
define('DB_NAME', 'your-db-name-with-the-locations-table-in-it');
?>
