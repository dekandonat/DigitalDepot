-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 23, 2025 at 12:24 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

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

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`userId`, `productId`, `quantity`) VALUES
(1, 1, 7),
(3, 2, 1);

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
(4, 'perifériák', NULL);

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
  `couponCode` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`orderId`, `userId`, `totalAmount`, `shippingAddress`, `orderDate`, `paymentMethod`, `couponCode`) VALUES
(1, 4, 464620, '2360 Gyál, Egressy út, 124 (Nagy Dávid)', '2025-12-22 12:17:16', NULL, NULL),
(2, 4, 95920, '2360 Gyál, Egressy út, 124 (Nagy Dávid)', '2025-12-22 12:25:37', NULL, NULL),
(3, 4, 29980, '2360 Gyál, Egressy út, 124 (Nagy Dávid)', '2025-12-22 12:32:14', NULL, NULL),
(4, 4, 29980, '2360 Gyál, Egressy út, 124 (Nagy Dávid)', '2025-12-22 12:38:03', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `prodId` int(11) NOT NULL,
  `productName` varchar(255) NOT NULL,
  `productDescription` varchar(255) NOT NULL,
  `productPrice` double NOT NULL,
  `productImg` varchar(255) NOT NULL,
  `categoryId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`prodId`, `productName`, `productDescription`, `productPrice`, `productImg`, `categoryId`) VALUES
(1, 'Wireless Mouse', 'Kényelmes, ergonomikus vezeték nélküli egér hosszú üzemidővel.', 5990, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3', 4),
(2, 'Gaming Keyboard', 'Mechanikus gamer billentyűzet RGB világítással.', 14990, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8', 4),
(3, 'USB-C Headphones', 'Kiváló minőségű USB-C füles zajszűréssel.', 8990, 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd', 4);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userId` int(11) NOT NULL,
  `userName` varchar(255) NOT NULL,
  `hashedPassword` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `verified` tinyint(1) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userId`, `userName`, `hashedPassword`, `email`, `verified`, `role`) VALUES
(1, 'mikieger', '$2b$10$juCm93ExS445n9hTeiWuGeVWn6XvJROuxyawpCLFfsMYXo059AzE.', 'halacska@gmail.com', 0, 'user'),
(3, 'sigma', '$2b$10$Wrmt3PAuG1bMSFR9qZa.f.Me.GdsYa/gkL4Bgv904BzshGm2SRL7G', 'sigma@gmail.com', 0, 'admin'),
(4, 'david', '$2b$10$VY/kxX33DfaWtsW1CHGl/.vbdH3H5WOVurV9f8b4eVdVpRShY4d2K', 'david@gmail.com', 0, 'user');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`userId`,`productId`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`categoryId`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`orderId`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`prodId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `categoryId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `orderId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `prodId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
