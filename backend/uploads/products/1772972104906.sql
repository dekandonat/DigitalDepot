-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2026. Már 01. 11:43
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `digitaldepot`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `carts`
--

CREATE TABLE `carts` (
  `userId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `carts`
--

INSERT INTO `carts` (`userId`, `productId`, `quantity`) VALUES
(1, 1, 7);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `categories`
--

CREATE TABLE `categories` (
  `categoryId` int(11) NOT NULL,
  `categoryName` varchar(255) NOT NULL,
  `parentId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `categories`
--

INSERT INTO `categories` (`categoryId`, `categoryName`, `parentId`) VALUES
(4, 'perifériák', NULL),
(5, 'Egerek', 4),
(6, 'Billentyűzetek', 4),
(7, 'Fejhallgatók', 4),
(12, 'Videókártya', NULL),
(13, 'Nvidia videókártya', 12),
(14, 'Számítógép alkatrészek', NULL),
(15, 'SSD', 14),
(16, 'Játékkonzol', NULL),
(17, 'Xbox', 16);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender` int(11) NOT NULL,
  `message` longtext NOT NULL,
  `sentAt` date DEFAULT NULL,
  `recipientId` int(11) DEFAULT NULL,
  `unread` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- Eseményindítók `messages`
--
DELIMITER $$
CREATE TRIGGER `log_messages` BEFORE DELETE ON `messages` FOR EACH ROW INSERT INTO message_logs(id, sender, message, sentAt, recipientId, unread) VALUES (OLD.id, OLD.sender, OLD.message, OLD.sentAt, OLD.recipientId, OLD.unread)
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `message_logs`
--

CREATE TABLE `message_logs` (
  `id` int(11) DEFAULT NULL,
  `sender` int(11) DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `sentAt` date DEFAULT NULL,
  `recipientId` int(11) DEFAULT NULL,
  `unread` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `message_logs`
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
(69, 3, 'a', '2026-03-01', 5, 0);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `orders`
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

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `order_items`
--

CREATE TABLE `order_items` (
  `orderId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `products`
--

CREATE TABLE `products` (
  `prodId` int(11) NOT NULL,
  `productName` varchar(255) NOT NULL,
  `productDescription` varchar(255) NOT NULL,
  `productPrice` double NOT NULL,
  `productImg` varchar(255) NOT NULL,
  `categoryId` int(11) NOT NULL,
  `averageRating` decimal(3,1) DEFAULT 0.0,
  `reviewCount` int(11) DEFAULT 0,
  `conditionState` varchar(255) DEFAULT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `products`
--

INSERT INTO `products` (`prodId`, `productName`, `productDescription`, `productPrice`, `productImg`, `categoryId`, `averageRating`, `reviewCount`, `conditionState`, `quantity`) VALUES
(1, 'Wireless Mouse', 'Kényelmes, ergonomikus vezeték nélküli egér hosszú üzemidővel. (Módosítás teszt)', 5990, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3', 5, 2.5, 2, NULL, 0),
(2, 'Gaming Keyboard', 'Mechanikus gamer billentyűzet RGB világítással.', 14990, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8', 6, 4.0, 1, NULL, 0),
(3, 'USB-C Headphones', 'Kiváló minőségű USB-C füles zajszűréssel.', 8990, 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd', 7, 0.0, 0, NULL, 0),
(5, 'gpu', 'gpu', 85000, 'uploads/products/1769866874750.webp', 13, 0.0, 0, 'felbontott', 0),
(6, 'Xbox Series S 500GB', 'Xbox Series S', 65000, 'uploads/products/1769868750623.webp', 17, 0.0, 0, 'használt', 0);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `refreshtokens`
--

CREATE TABLE `refreshtokens` (
  `tokenId` varchar(255) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `expiresAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `refreshtokens`
--

INSERT INTO `refreshtokens` (`tokenId`, `userId`, `createdAt`, `expiresAt`) VALUES
('1404df7d114956972cda5836d76b58a589162b05321bf9e71ff27a0557bc265d', 6, '2026-02-22 12:23:23', '2026-03-01 12:23:23'),
('601eae72cce36e16fbb4e5b1956b95c82febe6ce2706cb105c03a64dd30222d3', 7, '2026-03-01 10:06:05', '2026-03-08 10:06:05'),
('a305857b1a855e42ab317af4f566e77bc45678a23fd1c39b7b041c2766924ab9', 5, '2026-03-01 11:38:11', '2026-03-08 11:38:11'),
('d7a036ce5c67e1288b84b33b4a75357a92c955d8841998fc98e9124949feaa9b', 3, '2026-03-01 11:43:05', '2026-03-08 11:43:05');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `reviews`
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
-- A tábla adatainak kiíratása `reviews`
--

INSERT INTO `reviews` (`reviewId`, `userId`, `productId`, `rating`, `comment`, `reviewDate`) VALUES
(1, 4, 1, 4, 'jo', '2026-01-16 14:44:12'),
(2, 4, 1, 1, 'megsem jo', '2026-01-16 14:44:33'),
(3, 4, 2, 4, 'szuper', '2026-01-26 10:58:18');

--
-- Eseményindítók `reviews`
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
-- Tábla szerkezet ehhez a táblához `used_product_submissions`
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
-- A tábla adatainak kiíratása `used_product_submissions`
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
-- Tábla szerkezet ehhez a táblához `users`
--

CREATE TABLE `users` (
  `userId` int(11) NOT NULL,
  `userName` varchar(255) NOT NULL,
  `hashedPassword` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `verified` tinyint(1) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'user',
  `bankAccountNumber` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_hungarian_ci;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`userId`, `userName`, `hashedPassword`, `email`, `verified`, `role`, `bankAccountNumber`) VALUES
(1, 'mikieger', '$2b$10$juCm93ExS445n9hTeiWuGeVWn6XvJROuxyawpCLFfsMYXo059AzE.', 'halacska@gmail.com', 0, 'user', NULL),
(3, 'sigma', '$2b$10$Wrmt3PAuG1bMSFR9qZa.f.Me.GdsYa/gkL4Bgv904BzshGm2SRL7G', 'sigma@gmail.com', 0, 'admin', 'dsreafea'),
(4, 'david', '$2b$10$VY/kxX33DfaWtsW1CHGl/.vbdH3H5WOVurV9f8b4eVdVpRShY4d2K', 'david@gmail.com', 0, 'user', '1177151340051718229'),
(5, 'dekandonat', '$2b$10$I.TVUMgEirnlijxZTR503.gOqLtbANdXVDKoTzkzTLJWw/MQXX8/O', 'dekandoni@gmail.com', 0, 'user', NULL),
(6, 'kecske', '$2b$10$dr6gBBKT5ziRrbeBPl/8PORf/BOFZfmU7o0kziSD8dHt2.zczdhme', 'kecske@gmail.com', 0, 'user', NULL),
(7, 'uborka', '$2b$10$V34tCAawwi2B/FRRRGXD0exaYqmVj/s.KPQv0Aw17bOJpefiD7Vy6', 'uborka@gmail.com', 0, 'user', NULL);

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`userId`,`productId`);

--
-- A tábla indexei `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`categoryId`);

--
-- A tábla indexei `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender` (`sender`),
  ADD KEY `recipientId` (`recipientId`);

--
-- A tábla indexei `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`orderId`);

--
-- A tábla indexei `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`orderId`,`productId`),
  ADD KEY `productId` (`productId`);

--
-- A tábla indexei `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`prodId`);

--
-- A tábla indexei `refreshtokens`
--
ALTER TABLE `refreshtokens`
  ADD PRIMARY KEY (`tokenId`);

--
-- A tábla indexei `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`reviewId`),
  ADD KEY `userId` (`userId`),
  ADD KEY `productId` (`productId`);

--
-- A tábla indexei `used_product_submissions`
--
ALTER TABLE `used_product_submissions`
  ADD PRIMARY KEY (`submissionId`),
  ADD KEY `userId` (`userId`);

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `categories`
--
ALTER TABLE `categories`
  MODIFY `categoryId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT a táblához `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT a táblához `orders`
--
ALTER TABLE `orders`
  MODIFY `orderId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT a táblához `products`
--
ALTER TABLE `products`
  MODIFY `prodId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT a táblához `reviews`
--
ALTER TABLE `reviews`
  MODIFY `reviewId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `used_product_submissions`
--
ALTER TABLE `used_product_submissions`
  MODIFY `submissionId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `userId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`recipientId`) REFERENCES `users` (`userId`);

--
-- Megkötések a táblához `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`orderId`),
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`prodId`);

--
-- Megkötések a táblához `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`prodId`);

--
-- Megkötések a táblához `used_product_submissions`
--
ALTER TABLE `used_product_submissions`
  ADD CONSTRAINT `used_product_submissions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
