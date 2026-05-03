-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 02, 2026 at 05:52 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `digitaldepot`
--
CREATE DATABASE IF NOT EXISTS `digitaldepot` DEFAULT CHARACTER SET utf8 COLLATE utf8_hungarian_ci;
USE `digitaldepot`;

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `userId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `categoryId` int(11) NOT NULL,
  `categoryName` varchar(255) NOT NULL,
  `parentId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`categoryId`, `categoryName`, `parentId`) VALUES
(4, 'Perifériák', NULL),
(5, 'Egerek', 4),
(6, 'Billentyűzetek', 4),
(7, 'Fejhallgatók', 4),
(14, 'Számítógép alkatrészek', NULL),
(15, 'SSD', 14),
(16, 'Játékkonzolok', NULL),
(17, 'Xbox', 16),
(21, 'Monitorok', 4),
(22, 'Processzor (CPU)', 14),
(23, 'Videókártya', 14),
(24, 'Memória (RAM)', 14),
(25, 'PlayStation', 16),
(26, 'Nintendo', 16),
(27, 'Kiegészítők', 16),
(28, 'Alaplap', 14),
(29, 'Tápegység (PSU)', 14),
(30, 'Számítógépház', 14),
(31, 'Processzor hűtő', 14);

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL,
  `value` int(11) DEFAULT NULL,
  `usedAt` date DEFAULT NULL,
  `orderId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `value`, `usedAt`, `orderId`) VALUES
(1, 'a', 1000, '2026-04-01', 1),
(2, 'aaaa', 10, '2026-04-01', 22),
(3, 'aaaa2', 10, NULL, NULL),
(4, '11111', 111, '2026-04-07', 23),
(5, 'a1', 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sender` int(11) NOT NULL,
  `message` text DEFAULT NULL,
  `sentAt` datetime DEFAULT NULL,
  `recipientId` int(11) DEFAULT NULL,
  `unread` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- Triggers `messages`
--
DELIMITER $$
CREATE TRIGGER `log_messages` BEFORE DELETE ON `messages` FOR EACH ROW INSERT INTO message_logs(id, sender, message, sentAt, recipientId, unread) VALUES (OLD.id, OLD.sender, OLD.message, OLD.sentAt, OLD.recipientId, OLD.unread)
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `message_logs`
--

CREATE TABLE `message_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sender` int(11) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `sentAt` date DEFAULT NULL,
  `recipientId` int(11) DEFAULT NULL,
  `unread` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- Dumping data for table `message_logs`
--

INSERT INTO `message_logs` (`id`, `sender`, `message`, `sentAt`, `recipientId`, `unread`) VALUES
(43, 5, 'Szia, kéne egy kis segítség!', '2026-03-01', NULL, 0),
(44, 3, 'Szia kedves felhasználó, szüneten vagyok', '2026-03-01', 5, 0),
(45, 5, 'na és most?', '2026-03-01', NULL, 0),
(46, 3, 'nah', '2026-03-01', 5, 0),
(47, 3, 'Szoszi', '2026-03-01', 5, 0),
(48, 5, 'Szia papi', '2026-03-01', NULL, 0),
(49, 3, 'nagyon menő a jelző', '2026-03-01', 5, 0),
(50, 3, 'profi munka lett', '2026-03-01', 5, 0),
(51, 5, 'kösz', '2026-03-01', NULL, 0),
(52, 3, 'sziv', '2026-03-01', 5, 0),
(53, 3, 'na most milyen lett?', '2026-03-01', 5, 0),
(54, 3, 'így most minden pacek?', '2026-03-01', 5, 0),
(55, 5, 'yes sir', '2026-03-01', NULL, 0),
(56, 3, 'kijelentkezve is?', '2026-03-01', 5, 0),
(57, 3, 'halohalo', '2026-03-01', 5, 0),
(58, 3, 'na most?', '2026-03-01', 5, 0),
(59, 3, 'csigabiga', '2026-03-01', 5, 0),
(60, 3, 'halooooo', '2026-03-01', 5, 0),
(61, 3, 'fbsdbfiusdf', '2026-03-01', 5, 0),
(62, 3, 'haloooooooooooooooo', '2026-03-01', 5, 0),
(63, 3, 'a', '2026-03-01', 5, 0),
(64, 3, 'a', '2026-03-01', 5, 0),
(65, 3, 'a', '2026-03-01', 5, 0),
(66, 3, 'a', '2026-03-01', 5, 0),
(67, 3, 'a', '2026-03-01', 5, 0),
(68, 5, 'aaaaaaaaaaaaaááááááááááááááááááá', '2026-03-01', NULL, 1),
(69, 3, 'a', '2026-03-01', 5, 0),
(70, 4, 'Nem akarok fizetni', '2026-03-10', NULL, 0),
(71, 3, 'veged van', '2026-03-10', 4, 0),
(72, 3, 'veged', '2026-03-10', 4, 0),
(73, 3, 'fizetes van', '2026-03-10', 4, 0),
(74, 3, 'most', '2026-03-10', 4, 0),
(75, 4, 'sybau', '2026-03-10', NULL, 0),
(76, 3, 'kbqdcbcvé', '2026-03-10', 4, 0),
(77, 4, 'hbkecbeci', '2026-03-10', NULL, 0),
(78, 3, 'efge', '2026-03-10', 4, 1),
(79, 4, 'rgwagr5', '2026-03-10', NULL, 0),
(80, 4, 'argr', '2026-03-10', NULL, 0),
(81, 4, 'rgwgarg', '2026-03-10', NULL, 0),
(82, 4, 'wergr', '2026-03-10', NULL, 0),
(83, 4, 'rgg', '2026-03-10', NULL, 0),
(84, 4, 'r', '2026-03-10', NULL, 0),
(85, 4, 'g', '2026-03-10', NULL, 0),
(86, 4, 'rg', '2026-03-10', NULL, 0),
(87, 4, 'g', '2026-03-10', NULL, 0),
(88, 4, 'rg', '2026-03-10', NULL, 0),
(89, 4, 'g', '2026-03-10', NULL, 0),
(90, 4, 'rgg', '2026-03-10', NULL, 0),
(91, 4, 'grg', '2026-03-10', NULL, 0),
(92, 4, 'rg', '2026-03-10', NULL, 0),
(93, 3, 'trh', '2026-03-10', 4, 1),
(94, 3, 'ewrgh', '2026-03-10', 4, 1),
(95, 3, 'rgh', '2026-03-10', 4, 1),
(96, 3, 'r', '2026-03-10', 4, 1),
(97, 3, 'her', '2026-03-10', 4, 1),
(98, 3, 'wh', '2026-03-10', 4, 1),
(99, 3, 'rh', '2026-03-10', 4, 1),
(100, 3, 'r', '2026-03-10', 4, 1),
(101, 3, 'rh', '2026-03-10', 4, 1),
(102, 4, 'rg', '2026-03-10', NULL, 0),
(103, 4, 'wer', '2026-03-10', NULL, 0),
(104, 4, 'rgh', '2026-03-10', NULL, 0),
(105, 4, 'r', '2026-03-10', NULL, 0),
(106, 4, 'gh', '2026-03-10', NULL, 0),
(107, 4, 'rghr', '2026-03-10', NULL, 0),
(108, 4, 'rgh', '2026-03-10', NULL, 0),
(109, 4, 'erghh', '2026-03-10', NULL, 0),
(110, 4, 'r', '2026-03-10', NULL, 0),
(111, 4, 'h', '2026-03-10', NULL, 0),
(112, 4, 'rh', '2026-03-10', NULL, 0),
(113, 4, 'rghe', '2026-03-10', NULL, 0),
(114, 4, 'rt', '2026-03-10', NULL, 0),
(115, 4, 'e', '2026-03-10', NULL, 0),
(116, 4, 'h', '2026-03-10', NULL, 0),
(117, 4, 'e', '2026-03-10', NULL, 0),
(118, 7, 'Sziaaaaaaa', '2026-03-17', NULL, 0),
(119, 7, 'Segííííts', '2026-03-17', NULL, 0),
(120, 5, 'nem', '2026-03-17', 7, 0),
(121, 7, 'de', '2026-03-17', NULL, 0),
(122, 7, 'a', '2026-03-17', NULL, 0),
(123, 7, 'ia', '2026-03-17', NULL, 0),
(124, 7, 'a', '2026-03-17', NULL, 0),
(125, 5, 'a', '2026-03-17', 7, 0),
(126, 5, 'a', '2026-03-17', 7, 0),
(127, 5, 'a', '2026-03-17', 7, 0),
(128, 5, 'a', '2026-03-17', 7, 0),
(129, 7, 'Szia', '2026-03-17', NULL, 0),
(130, 7, 'hehe', '2026-03-17', NULL, 0),
(131, 7, 'aaaaa', '2026-03-17', NULL, 0),
(132, 7, 'pls működj', '2026-03-17', NULL, 0),
(133, 7, 'a', '2026-03-17', NULL, 0),
(134, 7, 'a', '2026-03-17', NULL, 0),
(135, 7, 'a', '2026-03-17', NULL, 0),
(136, 7, 'a', '2026-03-17', NULL, 0),
(137, 7, 'a', '2026-03-17', NULL, 0),
(138, 7, 'help', '2026-03-17', NULL, 1),
(139, 7, 'működj már', '2026-03-17', NULL, 0),
(140, 7, 'mi van már?', '2026-03-17', NULL, 0),
(141, 7, 'aaaaa', '2026-03-17', NULL, 0),
(142, 7, 'aaaaqaaq', '2026-03-17', NULL, 0),
(143, 7, 'aaaaaa', '2026-03-17', NULL, 0),
(144, 7, 'most?', '2026-03-17', NULL, 1),
(145, 5, 'aaaa', '2026-03-31', 7, 1),
(146, 7, 'a', '2026-04-10', NULL, 1),
(147, 7, 'a', '2026-04-10', NULL, 1),
(148, 5, 'pupákű', '2026-04-10', 7, 0),
(149, 14, 'help', '2026-04-12', NULL, 1),
(150, 5, 'nem', '2026-04-12', 14, 1),
(151, 7, 'Szia, segíts', '2026-04-20', NULL, 0),
(152, 5, 'nem', '2026-04-20', 7, 1),
(153, 7, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1111111111111111111111a1a1a1a1a1aa1a1111111111111111111111111111111aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa11111111111111111111111111111111111111111', '2026-04-20', NULL, 0),
(154, 5, 'k', '2026-04-20', 7, 1),
(155, 7, 'a', '2026-04-20', NULL, 0),
(156, 7, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1111111111111111111111a1a1a1a1a1aa1a1111111111111111111111111111111aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa11111111111111111111111111111111111111111aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1111111111111111111111a1a1a1a1a1aa1a1111111111111111111111111111111aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa11111111111111111111111111111111111111111', '2026-04-20', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `news`
--

CREATE TABLE `news` (
  `id` int(11) NOT NULL,
  `img` varchar(255) NOT NULL,
  `alt` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `orderId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `totalAmount` int(11) NOT NULL,
  `shippingAddress` varchar(255) NOT NULL,
  `orderDate` datetime DEFAULT current_timestamp(),
  `paymentMethod` varchar(50) DEFAULT NULL,
  `couponCode` varchar(50) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Függőben'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`orderId`, `userId`, `totalAmount`, `shippingAddress`, `orderDate`, `paymentMethod`, `couponCode`, `status`) VALUES
(13, 4, 65900, '2360 Gyál, Egressy út, 124 (Nagy Dávid)', '2026-03-08 13:50:38', 'utanvet', '', 'Kiszállítás alatt'),
(14, 4, 150000, '2360 Gyál, Somogyi Béla, 56', '2026-03-15 13:03:58', 'utanvet', '', 'Függőben'),
(15, 5, 5990, '1195 Budapest, József Attila utca 78 (Dékán Donát)', '2026-03-17 15:12:53', 'utanvet', '', 'Függőben'),
(16, 5, 5990, '1195 Budapest, József Attila utca 78 (Dékán Donát)', '2026-03-17 15:14:50', 'utanvet', '', 'Törölve'),
(17, 5, 11980, '1195 Budapest, József Attila utca 78 (Dékán Donát)', '2026-03-17 15:57:57', 'utanvet', '', 'Függőben'),
(18, 5, 47920, '1195 Budapest, József Attila utca 78 (Dékán Donát)', '2026-03-17 16:24:08', 'utanvet', '', 'Függőben'),
(19, 5, 14990, '1195 Budapest, József Attila utca 78', '2026-04-01 19:27:35', 'utanvet', 'a', 'Függőben'),
(20, 5, 13990, '1195 Budapest, József Attila utca 78', '2026-04-01 19:32:16', 'utanvet', 'a', 'Függőben'),
(21, 5, 14990, '1195 Budapest, József Attila utca 78', '2026-04-01 19:40:32', 'utanvet', '', 'Függőben'),
(22, 5, 190, '1195 Budapest, József Attila utca 78', '2026-04-01 19:41:39', 'utanvet', 'aaaa', 'Függőben'),
(23, 5, 0, '1195 Budapest, József Attila utca 78', '2026-04-07 11:59:44', 'utanvet', '11111', 'Függőben');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `orderId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`orderId`, `productId`, `quantity`, `price`) VALUES
(13, 1, 8, 5990),
(13, 3, 2, 8990),
(14, 6, 1, 65000),
(15, 1, 1, 5990),
(16, 1, 1, 5990),
(17, 1, 2, 5990),
(18, 1, 8, 5990),
(19, 2, 1, 14990),
(20, 2, 1, 14990),
(21, 2, 1, 14990),
(22, 7, 2, 100),
(23, 7, 1, 100);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `prodId` int(11) NOT NULL,
  `productName` varchar(255) NOT NULL,
  `productDescription` text NOT NULL,
  `productPrice` double NOT NULL,
  `productImg` varchar(255) NOT NULL,
  `categoryId` int(11) NOT NULL,
  `averageRating` decimal(3,1) DEFAULT 0.0,
  `reviewCount` int(11) DEFAULT 0,
  `conditionState` varchar(255) DEFAULT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`prodId`, `productName`, `productDescription`, `productPrice`, `productImg`, `categoryId`, `averageRating`, `reviewCount`, `conditionState`, `quantity`) VALUES
(1, 'Wireless Mouse', 'Kényelmes, ergonomikus vezeték nélküli egér hosszú üzemidővel. (Módosítás teszt)', 5990, 'uploads/products/1776196768535.jpg', 5, 2.5, 2, '', 2),
(2, 'Gaming Keyboard', 'Mechanikus gamer billentyűzet RGB világítással.', 14990, 'uploads/products/1776196818420.jpg', 6, 4.0, 1, '', 1),
(3, 'USB-C Headphones', 'Kiváló minőségű USB-C füles zajszűréssel.', 8990, 'uploads/products/1776196842706.jpg', 7, 0.0, 0, '', 10),
(6, 'Xbox Series S 500GB', 'Xbox Series S', 65000, 'uploads/products/1776197131932.png', 17, 0.0, 0, 'használt', 2),
(7, 'fejhallgató', 'ez egy minőségi fejhallgató', 10500, 'uploads/products/1776196891141.jpg', 4, 0.0, 0, '', 997),
(13, 'Logitech G Pro X Superlight vezeték nélküli egér', 'A Logitech G Pro X Superlight egy ultrakönnyű, kevesebb mint 63 grammos vezeték nélküli egér. A precíz mozgáskövetésről a beépített HERO 25K érzékelő gondoskodik, amely 100 és 25 600 DPI közötti felbontást tesz lehetővé. A késleltetésmentes kapcsolatot az USB vevőegységen keresztül működő LIGHTSPEED technológia biztosítja. Az eszköz 5 programozható gombbal rendelkezik, beépített akkumulátora pedig akár 70 órás üzemidőt nyújt egyetlen töltéssel. A sima és akadálytalan siklást a nulla adalékanyagot tartalmazó PTFE talpak garantálják.', 49990, 'uploads/products/1777713178071.jpg', 5, 0.0, 0, NULL, 5),
(14, 'Keychron K2 V2 Mechanikus Billentyűzet', 'A Keychron K2 V2 egy 84 gombos, 75%-os kiosztású, kompakt mechanikus billentyűzet, amely natívan támogatja a Windows, macOS, Android és iOS operációs rendszereket. A gépelés mechanikáját a könnyen cserélhető (Hot-swappable) Gateron Brown kapcsolók adják, amelyeket fehér LED háttérvilágítás egészít ki. Csatlakozás terén Bluetooth 5.1 vezeték nélküli technológiát és vezetékes USB Type-C opciót is kínál. A hosszú vezeték nélküli használatról a beépített, 4000 mAh kapacitású lítium-ion akkumulátor gondoskodik.', 38500, 'uploads/products/1777713460228.jpg', 6, 0.0, 0, NULL, 8),
(15, 'HyperX Cloud III Gaming Fejhallgató', 'A HyperX Cloud III egy zárt kialakítású fejhallgató, amely az 53 mm-es neodímium mágneses meghajtóinak és a 10 Hz-től 21 kHz-ig terjedő frekvenciaátvitelének köszönhetően tiszta hangzást biztosít. A térbeli hangélményt a hardverhez kötött DTS Headphone:X Spatial Audio licenc garantálja. Kommunikációhoz egy levehető, 10 mm-es zajszűrős mikrofon áll rendelkezésre. A prémium memóriahabos fülpárnákkal ellátott headset USB-C, USB-A adapter, valamint hagyományos 3.5 mm-es Jack csatlakozóval is rendelkezik.', 34990, 'uploads/products/1777713508012.jpg', 7, 0.0, 0, NULL, 20),
(16, 'LG UltraGear 27GP850-B 27\" Gamer Monitor', 'Az LG UltraGear 27GP850-B egy 27 hüvelykes képátlóval rendelkező monitor, amelynek alapját egy széles színterű Nano IPS panel adja. A QHD, azaz 2560 x 1440 pixeles felbontás mellett 165 Hz-es alap, és túlhajtva akár 180 Hz-es képfrissítést, valamint 1 ms-os (GtG) válaszidőt kínál. A 400 cd/m² fényerővel rendelkező kijelző megkapta a VESA DisplayHDR 400 minősítést is. A képtörésmentes megjelenítést az NVIDIA G-SYNC kompatibilitás és az AMD FreeSync Premium technológia biztosítja. A monitor két HDMI és egy DisplayPort bemenettel lett felszerelve.', 129990, 'uploads/products/1777713586935.jpg', 21, 0.0, 0, NULL, 15),
(17, 'AMD Ryzen 7 7800X3D Processzor', 'Az AMD Ryzen 7 7800X3D egy Zen 4 architektúrára épülő, AM5 tokozással kompatibilis asztali processzor. A 8 fizikai maggal és 16 feldolgozó szállal rendelkező lapka 4,2 GHz-es alap órajelen üzemel, amely terhelés alatt akár 5,0 GHz-ig is felskálázódik. Különlegessége az AMD 3D V-Cache technológiája, amely révén 96 MB L3 gyorsítótárral rendelkezik. A processzor integrált AMD Radeon grafikus vezérlővel is fel van szerelve, tervezett maximális hőtermelése (TDP) pedig 120W.', 145000, 'uploads/products/1777713842330.jpg', 22, 0.0, 0, NULL, 4),
(18, 'ASUS ROG Strix GeForce RTX 4070 Ti 12GB', 'Az ASUS ROG Strix GeForce RTX 4070 Ti egy NVIDIA Ada Lovelace grafikus lapkára épülő videókártya. A 192-bites adatsínen kommunikáló, 12 GB kapacitású GDDR6X memóriával és 7680 CUDA maggal szerelt kártya OC módban 2790 MHz-es boost órajelre képes. A hardver hűtéséről a 3.15 slotos kialakítás és a három Axial-tech ventilátor gondoskodik. Támogatja a DLSS 3.0 és Ray Tracing technológiákat, a megjelenítőkhöz pedig három DisplayPort 1.4a és két HDMI 2.1a csatlakozón keresztül köthető. Használatához 750W-os tápegység ajánlott.', 389000, 'uploads/products/1777713950811.jpg', 23, 0.0, 0, NULL, 10),
(19, 'Samsung 990 PRO 2TB M.2 PCIe 4.0 SSD', 'A Samsung 990 PRO egy 2 TB kapacitású, M.2 2280 formátumú belső SSD meghajtó, amely a PCIe Gen 4.0 x4 interfészt és az NVMe 2.0 protokollt használja. A Samsung saját V-NAND TLC memóriachipjeire épülő adattároló szekvenciális olvasási sebessége elérheti a 7450 MB/s-ot, míg a szekvenciális írás a 6900 MB/s-ot. A műveletek gyorsítását egy 2 GB-os LPDDR4 SDRAM gyorsítótár segíti. Az eszköz megbízhatóságát jelzi a gyárilag megadott 1200 TBW élettartam paraméter.', 68990, 'uploads/products/1777714011215.jpg', 15, 0.0, 0, NULL, 20),
(20, 'Corsair Vengeance RGB 32GB (2x16GB) DDR5', 'A Corsair Vengeance RGB egy 32 GB összkapacitású, két darab 16 GB-os modulból álló DDR5 memóriacsomag. A modulok 6000 MT/s működési sebességre és CL36-os időzítésre lettek specifikálva, 1,35 V-os üzemi feszültség mellett. A memóriák egyaránt támogatják az Intel XMP 3.0 és az AMD EXPO profilokat az alaplapban történő automatikus hangoláshoz. A chipek hűtéséért egy tömör alumíniumból készült hűtőborda felel, amelynek gerincén dinamikus, 10 zónás ARGB világítás kapott helyet.', 250000, 'uploads/products/1777714076417.jpg', 24, 0.0, 0, NULL, 3),
(21, 'PlayStation 5 Slim 1TB', 'A PlayStation 5 Slim lemezes verziója egy karcsúsított kialakítású játékkonzol, amelyben egy 8 magos, 3,5 GHz-es AMD Zen 2 processzor és egy 10,3 TFLOPS teljesítményű AMD RDNA 2 grafikus chip dolgozik. A rendszert 16 GB GDDR6 memória és egy egyedi fejlesztésű, 1 TB kapacitású NVMe SSD egészíti ki. A beépített Ultra HD Blu-ray optikai meghajtó mellett a konzol támogatja a 4K felbontású, akár 120 képkocka/másodperc sebességű megjelenítést, valamint a 8K kimenetet. A perifériák csatlakoztatására kettő USB-C és kettő USB-A port szolgál.', 209990, 'uploads/products/1777714228750.jpg', 25, 0.0, 0, NULL, 5),
(22, 'Xbox Series X 1TB', 'Az Xbox Series X egy asztali konzol, amelynek hardveres alapját egy 3,8 GHz-en üzemelő, 8 magos AMD Zen 2 processzor adja. A grafikai feladatokért a 12,15 TFLOPS teljesítményű AMD RDNA 2 architektúra felel, 16 GB GDDR6 memória társaságában. A fájlok tárolására egy 1 TB-os NVMe SSD szolgál, amely a hátlapon található speciális Expansion Card foglalattal dedikált kártyákkal bővíthető. A konzol fel van szerelve egy 4K UHD Blu-ray meghajtóval, és képes a natív 4K felbontású tartalmak futtatására 120 FPS maximális képkockasebességgel.', 189990, 'uploads/products/1777714273355.jpg', 17, 0.0, 0, NULL, 6),
(23, 'Nintendo Switch OLED Modell', 'A Nintendo Switch OLED egy hibrid konzol, amely egy 7,0 hüvelykes, 1280x720 pixeles felbontású OLED érintőképernyőt kapott. A számítási teljesítményt egy egyedi kialakítású NVIDIA Tegra processzor nyújtja. A beépített 64 GB-os belső tárhely microSDHC vagy microSDXC kártyákkal bővíthető. A 4310 mAh kapacitású akkumulátor terheléstől függően 4,5–9 óra hordozható üzemidőt biztosít. A beépített Wi-Fi és Bluetooth 4.1 kapcsolat mellett a televíziós csatlakoztatást biztosító dokkoló egy vezetékes LAN porttal is fel van szerelve.', 129990, 'uploads/products/1777714390644.jpg', 26, 0.0, 0, NULL, 2),
(24, 'Sony DualSense Vezeték Nélküli Kontroller (Midnight Black)', 'A Sony DualSense egy vezeték nélküli kontroller, amely a PlayStation 5 konzol mellett PC, Mac, iOS és Android operációs rendszerekkel is kompatibilis. A Bluetooth 5.1 kapcsolaton vagy USB Type-C porton keresztül kommunikáló eszköz integrált, kettős aktuátoros haptikus visszajelzéssel, valamint az L2 és R2 gombokba épített, változó ellenállású adaptív ravasz mechanikával rendelkezik. A hangzásról a beépített mikrofon és hangszóró gondoskodik, de a vezérlő alján dedikált 3.5 mm-es jack csatlakozó is található. Energiaellátását egy 1560 mAh-s Li-ion akkumulátor biztosítja.', 27990, 'uploads/products/1777714441848.jpg', 27, 0.0, 0, NULL, 9),
(25, 'MSI MAG B650 TOMAHAWK WIFI Alaplap', 'Az MSI MAG B650 TOMAHAWK WIFI egy ATX szabványú alaplap, amely AMD AM5 foglalattal rendelkezik a Ryzen 7000 és 8000 szériás processzorok fogadására. A memóriatámogatást négy darab DDR5-ös DIMM foglalat biztosítja, amelyek maximálisan 192 GB RAM-ot és túlhajtva akár 7600 MHz-es sebességet is kezelnek. Az adattárolók számára három darab M.2 PCIe 4.0 foglalat és hat darab SATA III port áll rendelkezésre. A hálózati kapcsolatokat egy 2.5G LAN vezérlő, valamint a beépített AMD Wi-Fi 6E és Bluetooth 5.3 modul biztosítja. A bővítőkártyák fogadását egy megerősített PCIe 4.0 x16 slot teszi lehetővé.', 85990, 'uploads/products/1777714730809.jpg', 28, 0.0, 0, NULL, 12),
(26, 'Corsair RM850x 850W Tápegység', 'A Corsair RM850x egy teljesen moduláris felépítésű, 850 Watt maximális teljesítményű számítógépes tápegység. A termék 80 PLUS Gold energiahatékonysági tanúsítvánnyal rendelkezik, ami biztosítja a magas hatásfokú működést. A belső komponensek hűtését egy 135 mm-es, mágneses levitációs technológiát használó ventilátor végzi, amely alacsony terhelésnél a Zero RPM módnak köszönhetően teljesen leáll. A tápegység prémium minőségű, 105°C-ig hitelesített japán kondenzátorokat használ a megbízhatóság érdekében. A csomag az EPS12V és PCIe csatlakozók széles skáláját tartalmazza.', 59990, 'uploads/products/1777714798307.jpg', 29, 0.0, 0, NULL, 10),
(27, 'Fractal Design NORTH charcoal Számítógépház (Fekete/Diófa)', 'A Fractal Design North egy ATX, mATX és Mini-ITX alaplapokat támogató Mid-Tower kialakítású számítógépház, amelynek előlapja valódi diófa betétekkel és sűrű porszűrő hálóval készült. A bal oldali panel edzett üvegből (Tempered Glass) van kiképezve a belső hardverek megjelenítése érdekében. A ház maximum 355 mm hosszú videókártyát és 170 mm magas processzorhűtőt képes befogadni. A hűtésről gyárilag két darab előlapi 140 mm-es Aspect PWM ventilátor gondoskodik. Az előlapi I/O panelen két USB 3.0 Type-A, egy USB 3.1 Gen 2 Type-C, valamint a dedikált mikrofon és fejhallgató csatlakozók találhatók.', 62990, 'uploads/products/1777714877809.jpg', 30, 0.0, 0, NULL, 7),
(28, 'Noctua NH-D15 Processzorhűtő', 'A Noctua NH-D15 egy prémium kategóriás, dupla tornyos kialakítású léghűtéses processzorhűtő, amely hat darab réz hőcsővel és alumínium hűtőbordákkal rendelkezik. A hőeloszlatást két darab 140 mm-es NF-A15 PWM ventilátor végzi, amelyek maximális fordulatszáma 1500 RPM, zajszintjük pedig nem haladja meg a 24,6 dB(A) értéket. A csomag tartalmazza a SecuFirm2 rögzítőrendszert, amely kompatibilis az Intel LGA1700, LGA1200, valamint az AMD AM4 és AM5 foglalatokkal is. A hűtő magassága 165 mm, súlya a ventilátorokkal együtt 1320 gramm, és gyárilag mellékelik hozzá a díjnyertes NT-H1 hővezető pasztát.', 45990, 'uploads/products/1777714934037.jpg', 31, 0.0, 0, NULL, 15),
(29, 'Microsoft Xbox Elite Wireless Controller Series 2', 'Az Xbox Elite Series 2 egy professzionális, vezeték nélküli kontroller Xbox Series X/S, Xbox One és PC platformokhoz. A vezérlő mágnesesen cserélhető analóg karokkal, D-paddal és hátlapi pedálokkal rendelkezik, amelyek lehetővé teszik a hardveres testreszabást. Az analóg karok feszessége egy mellékelt eszközzel három fokozatban állítható, míg a ravaszok (LT/RT) útja fizikailag rövidíthető a gyorsabb reakcióidő érdekében. Az eszköz beépített, akár 40 óra üzemidőt biztosító akkumulátorral, Bluetooth kapcsolattal és USB-C porttal van felszerelve. A csomag egy töltődokkolóként is funkcionáló keményfedeles hordtáskát is tartalmaz.', 59990, 'uploads/products/1777714986192.jpg', 27, 0.0, 0, NULL, 8);

-- --------------------------------------------------------

--
-- Table structure for table `refreshtokens`
--

CREATE TABLE `refreshtokens` (
  `tokenId` varchar(255) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `expiresAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- Dumping data for table `refreshtokens`
--

INSERT INTO `refreshtokens` (`tokenId`, `userId`, `createdAt`, `expiresAt`) VALUES
('50a73b7eb4a823bd8a74abca4af98a92e5a872ac33116b70a7ee33687d54fd28', 5, '2026-04-20 14:37:27', '2026-04-27 14:37:27'),
('5b0a3010b7c611bda8020b9e08b99d3f913df16e4a3073b5952122907f9ccf07', 8, '2026-05-02 17:11:43', '2026-05-09 17:11:43'),
('f2c6ac28a9f8029767e05bb615487754df50546a39f82ba8d7aebbb22ae66459', 15, '2026-05-02 17:35:38', '2026-05-09 17:35:38'),
('fd568e2f6f4d8a4b3599d5312a1be70f5f07b6d97b22e221c37c720a6715a399', 4, '2026-05-02 10:23:26', '2026-05-09 10:23:26');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `reviewId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `reviewDate` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`reviewId`, `userId`, `productId`, `rating`, `comment`, `reviewDate`) VALUES
(1, 4, 1, 4, 'jo', '2026-01-16 14:44:12'),
(2, 4, 1, 1, 'megsem jo', '2026-01-16 14:44:33'),
(3, 4, 2, 4, 'szuper', '2026-01-26 10:58:18');

--
-- Triggers `reviews`
--
DELIMITER $$
CREATE TRIGGER `recalculate_rating_after_insert` AFTER INSERT ON `reviews` FOR EACH ROW UPDATE products 
SET 
    averageRating = (SELECT IFNULL(AVG(rating), 0) FROM reviews WHERE productId = NEW.productId),
    reviewCount = (SELECT COUNT(*) FROM reviews WHERE productId = NEW.productId)
WHERE prodId = NEW.productId
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `used_product_submissions`
--

CREATE TABLE `used_product_submissions` (
  `submissionId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `productName` varchar(255) NOT NULL,
  `productDescription` text NOT NULL,
  `conditionState` varchar(255) NOT NULL,
  `productImage` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT 'pending',
  `submissionDate` datetime DEFAULT current_timestamp(),
  `adminOfferPrice` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- Dumping data for table `used_product_submissions`
--

INSERT INTO `used_product_submissions` (`submissionId`, `userId`, `productName`, `productDescription`, `conditionState`, `productImage`, `status`, `submissionDate`, `adminOfferPrice`) VALUES
(1, 4, 'Samsung Monitor', '1440p 144hz Samsung Monitor', 'felbontott', NULL, 'pending', '2026-01-26 15:33:24', NULL),
(2, 4, 'tv', 'tv', 'felbontott', NULL, 'pending', '2026-01-30 19:30:01', NULL),
(3, 4, 'ram', 'ram', 'felbontott', NULL, 'pending', '2026-01-30 19:47:25', NULL),
(4, 4, 'konzol', 'konzol', 'felbontott', NULL, 'listed', '2026-01-30 19:54:23', 60000),
(5, 4, 'gpu', 'gpu', 'használt', NULL, 'listed', '2026-01-31 12:54:10', 80000),
(6, 4, 'ssd', 'ssd', 'felbontott', NULL, 'pending', '2026-01-31 13:53:58', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userId` int(11) NOT NULL,
  `userName` varchar(255) NOT NULL,
  `hashedPassword` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'user',
  `bankAccountNumber` varchar(50) DEFAULT NULL,
  `chatTopic` varchar(50) DEFAULT 'Egyéb'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userId`, `userName`, `hashedPassword`, `email`, `role`, `bankAccountNumber`, `chatTopic`) VALUES
(4, 'david', '$2b$10$VY/kxX33DfaWtsW1CHGl/.vbdH3H5WOVurV9f8b4eVdVpRShY4d2K', 'david@gmail.com', 'user', '1177151340051718229', 'Fizetés'),
(5, 'dekandonat', '$2b$10$2JnXkxx1m1/RDT2X8pGExubeXRaBav8THfcdEwgWTyMx7uSVjDd2e', 'dekandoni@gmail.com', 'owner', 'aaa', 'Egyéb'),
(8, 'owner', '$2b$10$7aei4nzccuZNQt8Nb1.3ZOo.BTt3bVNwLK1qQ4fgKIKHVRieHBGXq', 'owner@gmail.com', 'owner', NULL, 'Egyéb'),
(15, 'admin', '$2b$10$dZOQ/A7KN0LuIG2vsOxmdOgVkmzoOp24fIYO39PIO4wy2Bw5uGa6S', 'admin@gmail.com', 'admin', NULL, 'Egyéb');

-- --------------------------------------------------------

--
-- Table structure for table `user_addresses`
--

CREATE TABLE `user_addresses` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `zipCode` varchar(20) NOT NULL,
  `city` varchar(100) NOT NULL,
  `streetAddress` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- Dumping data for table `user_addresses`
--

INSERT INTO `user_addresses` (`id`, `userId`, `zipCode`, `city`, `streetAddress`) VALUES
(1, 4, '2360', 'Gyál', 'Somogyi Béla, 56');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`userId`,`productId`),
  ADD KEY `fk_carts_product` (`productId`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`categoryId`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender` (`sender`),
  ADD KEY `recipientId` (`recipientId`);

--
-- Indexes for table `message_logs`
--
ALTER TABLE `message_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`orderId`),
  ADD KEY `fk_orders_user` (`userId`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`orderId`,`productId`),
  ADD KEY `productId` (`productId`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`prodId`),
  ADD KEY `fk_products_category` (`categoryId`);

--
-- Indexes for table `refreshtokens`
--
ALTER TABLE `refreshtokens`
  ADD PRIMARY KEY (`tokenId`),
  ADD KEY `fk_tokens_user` (`userId`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`reviewId`),
  ADD KEY `userId` (`userId`),
  ADD KEY `productId` (`productId`);

--
-- Indexes for table `used_product_submissions`
--
ALTER TABLE `used_product_submissions`
  ADD PRIMARY KEY (`submissionId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `categoryId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=157;

--
-- AUTO_INCREMENT for table `news`
--
ALTER TABLE `news`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `orderId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `prodId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `reviewId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `used_product_submissions`
--
ALTER TABLE `used_product_submissions`
  MODIFY `submissionId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `user_addresses`
--
ALTER TABLE `user_addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `fk_carts_product` FOREIGN KEY (`productId`) REFERENCES `products` (`prodId`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_carts_user` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`recipientId`) REFERENCES `users` (`userId`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`orderId`),
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`prodId`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`categoryId`) ON DELETE CASCADE;

--
-- Constraints for table `refreshtokens`
--
ALTER TABLE `refreshtokens`
  ADD CONSTRAINT `fk_tokens_user` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`prodId`);

--
-- Constraints for table `used_product_submissions`
--
ALTER TABLE `used_product_submissions`
  ADD CONSTRAINT `used_product_submissions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- Constraints for table `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD CONSTRAINT `user_addresses_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
