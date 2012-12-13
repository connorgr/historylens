-- MySQL dump 10.13  Distrib 5.5.28, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: visualSummaries
-- ------------------------------------------------------
-- Server version	5.5.28-0ubuntu0.12.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `allCountries`
--

DROP TABLE IF EXISTS `allCountries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `allCountries` (
  `geo_id` int(11) unsigned NOT NULL,
  `geo_name` varchar(200) NOT NULL DEFAULT '',
  `geo_ansiname` varchar(200) NOT NULL DEFAULT '',
  `geo_alternate_names` varchar(2000) NOT NULL DEFAULT '',
  `geo_latitude` double(11,7) NOT NULL DEFAULT '0.0000000',
  `geo_longitude` double(11,7) NOT NULL DEFAULT '0.0000000',
  `geo_feature_class` char(1) DEFAULT NULL,
  `geo_feature_code` varchar(10) DEFAULT NULL,
  `geo_country_code` char(2) DEFAULT NULL,
  `geo_country_code2` varchar(60) DEFAULT NULL,
  `geo_admin1_code` varchar(20) DEFAULT '',
  `geo_admin2_code` varchar(80) DEFAULT '',
  `geo_admin3_code` varchar(20) DEFAULT '',
  `geo_admin4_code` varchar(20) DEFAULT '',
  `geo_population` bigint(11) DEFAULT '0',
  `geo_elevation` int(11) DEFAULT '0',
  `geo_gtopo30` int(11) DEFAULT '0',
  `geo_timezone` varchar(40) DEFAULT NULL,
  `geo_mod_date` date DEFAULT '0000-00-00',
  PRIMARY KEY (`geo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2012-12-13  2:38:35
