<?php
/*
   jQuery Folder Browser Connector
   -------------------------------

   Receives POST variables:
   		 'dir' containing the root folder to display


   Returns an unsorted JSON array containing folders and files.

*/

$root = '/home/sites/ant-planet.com'; // force a root path here to restrict access
$slash = '/';

$retarray = array();

function human_filesize($bytes, $decimals = 2) {
	$sz = 'BKMGTP';
	$factor = floor((strlen($bytes) - 1) / 3);
	return sprintf("%.{$decimals}f", $bytes / pow(1024, $factor)) . @$sz[$factor];
}

function file_search_dir($dir, $qry, &$results) {
	global $root;
	global $slash;

	$folders = array();

	$items = scandir($root . $dir); // (/home/sites/public_html/)
	foreach($items as $item) {

		if($item != '.' && $item != '..') {
			// see if this is a result
			$pos = stripos($item, $qry);
			if($pos !== false) {
				$ra['name'] = substr($item, 0, $pos) .
					'<span class="fbr-search-hilight">' .$qry .'</span>';
				$pos += strlen($qry);
				$ra['name'] .= substr($item, $pos, strlen($item) - $pos);

				$dir .= (substr($dir,-1) != '/' ? '/' : '');

				$ra['fullpath'] = $root . $dir . $item;
				$ra['relpath'] = $dir . $item;

				if(is_dir($ra['fullpath'])) {

					$ra['type'] = 'folder';
					$files2 = scandir($ra['fullpath']);
					$fcontents = count($files2);
					$ra['items'] = ($fcontents > 2 ? $fcontents - 2 : 0);

				} else {

					$ra['type'] = 'file';

					$ext = preg_replace('/^.*\./', '', $item);
					$ra['ext'] = $ext;

					// File properties
					if($stat = stat($ra['fullpath'])) {
						$ra['size'] = human_filesize($stat['size']);
						$ra['accessed'] = date("F d Y H:i:s.", $stat['atime']);
						$ra['modified'] = date("F d Y H:i:s.", $stat['mtime']);
						$ra['changed'] = date("F d Y H:i:s.", $stat['ctime']);	
					} else {
						$ra['size'] = 'err: stat: ';
						$ra['accessed'] = $ra['fullpath'];
						$ra['modified'] = '';
						$ra['changed'] = '';
					}

				}
				
				$results[] = $ra;
			}

			// add folders to a seperate list for recursive search
			// /root/path + / + data + /
			$newfolder = $dir .(substr($dir,-1) != '/' ? '/' : '') . $item .(substr($item,-1) != '/' ? '/' : '');
			if(is_dir($root . $newfolder)) 
				$folders[] = $newfolder;

		}
	}

	foreach ($folders as $folder) {
		
		file_search_dir($folder, $qry, $results);
		
	}

	return(true);
}

if(isset($_POST['dir'])) {
	if(substr($_POST['dir'],-1) != '/') $slash = '/';
	$_POST['dir'] = str_replace($root, '', $_POST['dir']);
} else { exit(); }

// if it's a search the query is after the folder within {} brackets
//   eg: /home/web/public_html/{search: *.jpg}
$searchqry = strstr($_POST['dir'], '"');

if($searchqry===false) {
	if( file_exists($root . $_POST['dir']) ) {
		$files = scandir($root . $_POST['dir']);
		natcasesort($files);
		if( count($files) > 2 ) { /* The 2 accounts for . and .. */	

			foreach( $files as $file ) {
				// files and folders in dir
				$cfile['name'] = $file;
				$cfile['fullpath'] = $root . $_POST['dir'] . $file;
				$cfile['relpath'] = $_POST['dir'] . $file;

				if($file != '.' && $file != '..') {

					if(file_exists($cfile['fullpath']) && is_dir($cfile['fullpath']) ) {
						
						// Add a folder
						
						$cfile['type'] = 'folder';
						$files2 = scandir($cfile['fullpath']);
						$fcontents = count($files2);
						$cfile['items'] = ($fcontents > 2 ? $fcontents - 2 : 0);

					}
					if( file_exists($cfile['fullpath']) && !is_dir($cfile['fullpath']) ) {
						
						// Add a file
						$ext = preg_replace('/^.*\./', '', $file);

						$cfile['type'] = 'file';
						$cfile['ext'] = $ext;

						// File properties
						$stat = stat($cfile['fullpath']);
						$cfile['size'] = human_filesize($stat['size']);
						$cfile['accessed'] = date("F d Y H:i:s.", $stat['atime']);
						$cfile['modified'] = date("F d Y H:i:s.", $stat['mtime']);
						$cfile['changed'] = date("F d Y H:i:s.", $stat['ctime']);
						
					}
					$retarray[] = $cfile;
				}
			}

			echo(json_encode($retarray));
		}

	} else {
		echo("err: file doesnt exist.");
	}
} else {
	// Do a recursive search and return the results

	$dir = trim(str_replace($searchqry, '', $_POST['dir']));

	$searchqry = str_replace('"', '', $searchqry);
	$searchqry = str_replace('search: ', '', $searchqry);

	$allresults = array();
	file_search_dir($dir, $searchqry, $allresults);

	echo(json_encode($allresults));
}

?>