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

function eqClause($column, $value) {
	 return isset($value) ? array($column . " = " . $value) : array();
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

function performQuery($table, $columns, $join, $filter, $groupBy, $limit)
{
	$select = "SELECT " . join(", ", $columns) . " FROM " . $table;
	$where = empty($filter) ? "" : " WHERE " . $filter[0];
	$groupBy = empty($groupBy) ? "" : " GROUP BY " . join(", ", $groupBy);
	#$orderBy = empty($orderBy) ? "" : " ORDER BY " . join(", ", $orderBy);
	$limit = empty($limit) ? "" : " LIMIT " . $limit;
	$query = $select . $join . $where . $groupBy . $limit . ";";
	mysql_query("SET CHARACTER SET utf8;");
	#echo "QUERY: " . $query;
	return mysql_query($query);
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
		eqClause("originalData", "0"),
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

function mapQueryOLD($json)
{
	global $regionLevelMapping;

	$regionLevel = $regionLevelMapping[withDefault($json, "regionLevel", 1)];
	$columns = array("COUNT(*)", $regionLevel, "tagName", "name", "AVG(latitude)", "AVG(longitude)");
	$filter = makeFilter($json);
	$groupBy = array($regionLevel, "tagName");
	#$orderBy = "COUNT(*) desc"
	$result = performQuery($columns, $filter, $groupBy, false);

	$row = false;
	$data = array();
	while ($row = mysql_fetch_array($result)) {
		$count = $row[0];
		$region = $row[1];
		$tagName = $row[2];
		if (!isset($data[$region])) {
			$data[$region] = array("placeName" => $row[3], "lat" => $row[4], "long" => $row[5], "topics" => array());
		}
		$data[$region]["topics"][$tagName] = $count;
	}
	return $data;
}


function mapQuery($json)
{
	global $regionLevelMapping;

	$join = "";
	$columns = array();
	$groupBy = array();
	$regionLevel = $regionLevelMapping[withDefault($json, "regionLevel", 1)];
	switch(withDefault($json, "regionLevel", 1))
	{
	case 1:
		$columns = array("COUNT(*)", "regionName as placeName", "tagName", "AVG(latitude)", "AVG(longitude)");
		$join = " INNER JOIN country_tbl r on r.country_code = pt.country_code ";
		$groupBy = array("pt.country_code", "pt.tagName");
		break;
	case 2:
		$columns = array("COUNT(*)", "regionName as placeName", "tagName", "AVG(latitude)", "AVG(longitude)");
		$join = " INNER JOIN region1_tbl r on r.region1 = pt.region1 ";
		$groupBy = array("pt.country_code", "pt.region1", "pt.tagName");
		break;
	case 3:
		$columns = array("COUNT(*)", "regionName as placeName", "tagName", "AVG(latitude)", "AVG(longitude)");
		$join = " INNER JOIN region2_tbl r on r.region2 = pt.region2 ";
		$groupBy = array("pt.country_code", "pt.region1", "pt.region2", "pt.tagName");
		break;
	default:
		$columns = array("COUNT(*)", "name", "tagName", "AVG(latitude)", "AVG(longitude)");
		$groupBy = array("placeId", "tagName");
	}

	
	$filter = makeFilter($json);
	#$orderBy = "COUNT(*) desc"
	$result = performQuery("placeTag_vw pt", $columns, $join, $filter, $groupBy, false);

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
	$join = "";
	$filter = makeFilter($json);
	$groupBy = array("pubYear", "tagName");
	$result = performQuery("placeTag_vw", $columns, $join, $filter, $groupBy, false);
	$row = false;
	$data = array();
	while ($row = mysql_fetch_array($result)) {
		$count = $row[0];
		$pubYear = $row[1];
		$tagName = $row[2];
		if (!isset($data[$pubYear])) {
			$data[$pubYear] = array();
		}
		$data[$pubYear][$tagName] = $count;
	}
	return $data;
}

function documentQuery($json)
{
	$columns = array("title", "pubYear", "url");
	$join = "";
	$filter = makeFilter($json);
	$groupBy = array("docId");
	$result = performQuery("allDocInfo_vw", $columns, $join, $filter, $groupBy, 100);

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
	$results = array(
		"map" => mapQuery($json),
		"timeline" => timelineQuery($json),
		"document" => documentQuery($json));
	return json_encode($results);
}


/* Return JSON data upon a GET request. */

header('Content-Type: application/json');
$q = $_GET["q"];
echo bigQuery($q);

mysql_close($connection);

?>
