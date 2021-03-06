<?php

/* Open a db connection */

$username = "root";
$password = "";
$database = "visualSummaries";

$connection = mysql_connect("localhost", $username, $password);
@mysql_select_db($database) or die("Unable to select database");


/* Constructing SQL query strings */

function withDefault($array, $key, $default) {
	return isset($array[$key]) ? $array[$key] : $default;
}

function minClause($column, $min) {
	return isset($min) ? array($column . " >= " . $min) : array();
}

function maxClause($column, $max) {
	return isset($max) ? array($column . " <= " . $max) : array();
}

function likeClause($column, $like) {
	return isset($like) ? array($column . " like '%" . $like . "%'") : array();
}

function andClause($clauses) {
	return empty($clauses) ? array() : array("(" . join(" AND ", $clauses) . ")");
}

function orClause($clauses) {
	return empty($clauses) ? array() : array("(" . join(" OR ", $clauses) . ")");
}

function createQueryString($columns, $filter, $groupBy, $limit)
{
	$select = "SELECT " . join(", ", $columns) . " FROM allDocInfo_vw";
	$where = empty($filter) ? "" : " WHERE " . $filter[0];
	$groupBy = empty($groupBy) ? "" : " GROUP BY " . join(", ", $groupBy);
	$limit = empty($limit) ? "" : " LIMIT " . $limit;
	return $select . $where . $groupBy . $limit . ";";
}


/* Our application-specific queries */

$regionLevelMapping = array(1 => "country_code", 2 => "region1", 3 => "region2");

function authorFilter($authors) {
	$singleAuthorFilter = function($author) {
		return likeClause("authorName", $author);
	};
	$clauses = array_map($singleAuthorFilter, $authors);
	return orClause($clauses);
}

function topicFilter($topics) {
	$singleTopicFilter = function($topic) {
		return likeClause("tagName", $topic);
	};
	return orClause(array_map($singleTopicFilter, $topics));
}

function makeFilter($json)
{
	$filters = array();
	$filters = array_merge($filters,
		authorFilter(withDefault($json, "authors", array())),
		topicFilter(withDefault($json, "topics", array())),
		minClause("latitude", withDefault($json, "min_latitude", NULL)),
		maxClause("latitude", withDefault($json, "max_latitude", NULL)),
		minClause("longitude", withDefault($json, "min_longitude", NULL)),
		maxClause("longitude", withDefault($json, "max_longitude", NULL)),
		minClause("pubYear", withDefault($json, "min_year", NULL)),
		maxClause("pubYear", withDefault($json, "max_year", NULL)));
	return andClause($filters);
}

function mapQuery($json)
{
	global $regionLevelMapping;

	$regionLevel = $regionLevelMapping[withDefault($json, "regionLevel", 2)];
	$columns = array("COUNT(*)", $regionLevel, "tagName", "AVG(latitude)", "AVG(longitude)");
	$filter = makeFilter($json);
	$groupBy = array($regionLevel, "tagName");
	$query = createQueryString($columns, $filter, $groupBy, false);
	$result = mysql_query($query);

	$row = false;
	$data = array();
	while ($row = mysql_fetch_array($result)) {
		$count = $row[0];
		$region = $row[1];
		$tagName = $row[2];
		if (!isset($data[$region])) {
			$data[$region] = array("lat" => $row[3], "long" => $row[4], "topics" => array());
		}
		$data[$region]["topics"][$tagName] = $count;
	}
	return $data;
}

function timelineQuery($json)
{
	$columns = array("COUNT(*)", "pubYear", "tagName");
	$filter = makeFilter($json);
	$groupBy = array("pubYear", "tagName");
	$query = createQueryString($columns, $filter, $groupBy, false);
	$result = mysql_query($query);

	$row = false;
	$data = array();
/*	while ($row = mysql_fetch_array($result)) {
		$count = $row[0];
		$pubYear = $row[1];
		$tagName = $row[2];
		$data[] = array('pubYear' => $pubYear, 'tagName' => $tagName, 'count' => $count);
//		if (!isset($data[$pubYear])) {
//			$data[$pubYear] = array();
//		}
//		$data[$pubYear][$tagName] = $count;
	}
	*/
	$data[] = array('a' => 'abc', 'b' => 'cde');
	return $data;
}

function documentQuery($json)
{
	$columns = array("title", "pubYear", "url");
	$filter = makeFilter($json);
	$groupBy = array("docId");
	$query = createQueryString($columns, $filter, $groupBy, 100);
	$result = mysql_query($query);

	$row = false;
	$data = array();
	while ($row = mysql_fetch_array($result)) {
		$title = $row[0];
		$pubYear = $row[1];
		$url = $row[2];
		$doc = array("title" => $title, "pubYear" => $pubYear, "url" => $url);
		array_push($data, $doc);
	}
	return $data;
}

function bigQuery($jsonString) {
	$json = json_decode($jsonString, true);
	echo $json;
//	$results = timelineQuery($json);
    $results = array();
    $results[] = array('a' => 'abc', 'b' => 'cde');
//	$results = 
//		"map" => mapQuery($json),
//		"timeline" => timelineQuery($json);
//		"document" => documentQuery($json));
	return json_encode($results);
}


/* Return JSON data upon a GET request. */

header('Content-Type: application/json');
$q = $_GET["q"];
echo bigQuery($q);

mysql_close($connection);

?>
