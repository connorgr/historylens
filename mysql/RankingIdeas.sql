SELECT t.* from(
SELECT COUNT(*), 
region1, 
tagName, 
name, 
AVG(latitude), 
AVG(longitude),
(CASE region1
WHEN @curRegion
THEN @curRow := @curRow + 1
ELSE @curRow := 1 AND @curRegion := region1 END) as rank
FROM allDocInfo_vw ad CROSS JOIN (SELECT @curRow := 0, @curRegion := '') r
GROUP BY region1, tagName
ORDER BY region1, tagName) t

SELECT t.* from(SELECT COUNT(*),region1,tagName,name, AVG(latitude), AVG(longitude),CASE region1 WHEN @curRegion THEN @curRow := @curRow + 1 ELSE @curRow := 1 AND @curRegion := region1 END) as rank FROM allDocInfo_vw ad CROSS JOIN (SELECT @curRow := 0, @curRegion := '') r GROUP BY region1, tagName ORDER BY regionX, tagName) t;

SELECT t.* from(
SELECT COUNT(*),
country_code, 
region1,
tagName, 
name,
(CASE region1
WHEN @curRegion
THEN @curRow := @curRow + 1
ELSE @curRow := 1 AND @curRegion := region1 END) as rank
FROM allDocInfo_vw ad INNER JOIN (SELECT @curRow := 0, @curRegion := '') r
where region1 <> ''
and country_code <> ''
GROUP BY country_code, region1, tagName
ORDER BY country_code, region1, count(*) desc) t
where rank <= 5
order by country_code, region1, rank
limit 10;

select country_code,
region1,
region2,
count('')
from allCountries
where country_code = region1 = 'CA'
group by country_code, region1,region2

******* WINNER ********
select 
@curRow:=CASE WHEN @curRegion <> region1 OR @curCountry <> country_code THEN 0 WHEN @curRow = 10 THEN 10 ELSE @curRow+1 END as rank,
@curRegion:=region1 AS rgset,
@curCountry:=country_code AS country_set,
country_code, region1, name,
CASE WHEN @curRow = 10 THEN 'OTHER' ELSE tagName END as tag,
sum(cnt)
FROM
(SELECT @curRow:=0) r,
(SELECT @curRegion:='') re,
(SELECT @curCountry:='') cc,
(SELECT country_code, region1, tagName, name, count(*) as cnt
FROM allDocInfo_vw
WHERE country_code is not null and country_code <> '' and region1 is not null and region1 <> ''
GROUP BY country_code,region1,tagName
ORDER BY country_code, region1, cnt desc) t
GROUP BY country_code, region1, tag
ORDER BY country_code, region1, rank;
************************

/**
IDEA: create a stored procedure that will drop and recreate the map and timeline data aggregates.  should speed up query time substancially.
NEED: more data
IDEA: add a document
	- this will need to search database for the proper place OR maybe it will only work for places that are already on the map
*/
