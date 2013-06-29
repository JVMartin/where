where
=====

Where To Recycle App

This is a PHP-based interactive web app to show people in the city of Albuquerque where they can go to recycle different materials using AJAX.

To deploy the app, you must load the `locations` table dump file - `locations.sql` - from the main project directory into a MySQL database.

Then, create a constants.php file in the /common/ folder that looks like this:

<?php
define('DB_HOST', 'your.mysql.domain.or.ip.com');
define('DB_USER', 'your-db-user');
define('DB_PASS', 'your-db-pass');
define('DB_NAME', 'your-db-name-with-the-locations-table-in-it');
?>

Then, the app will run.

Note:

The `locations` table was created automatically from an Excel spreadsheet.  The spreadsheet was very poorly designed and organized and we'll need to create an entirely new DB schema in order to get a usable, expandable product in place.
