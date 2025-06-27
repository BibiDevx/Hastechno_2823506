-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 27-06-2025 a las 02:19:54
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tienda`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `admin`
--

CREATE TABLE `admin` (
  `idAdmin` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `cedulaAdmin` varchar(45) NOT NULL,
  `nombreAdmin` varchar(45) NOT NULL,
  `apellidoAdmin` varchar(45) NOT NULL,
  `telefonoAdmin` varchar(15) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `admin`
--

INSERT INTO `admin` (`idAdmin`, `idUsuario`, `cedulaAdmin`, `nombreAdmin`, `apellidoAdmin`, `telefonoAdmin`, `created_at`, `updated_at`) VALUES
(1, 1, '12345678', 'admin', 'admin', '3123456789', '2025-04-03 23:20:37', '2025-04-19 06:37:04'),
(2, 3, '12346789', 'miniAdmin', 'admin', '3123456789', '2025-04-05 05:18:29', '2025-04-17 09:51:05'),
(3, 4, '111', 'Super', 'Admin', '3123456789', '2025-04-17 09:13:27', '2025-04-17 09:13:27'),
(4, 5, '222', 'master', 'Admin', '3123456789', '2025-04-17 09:15:59', '2025-04-17 09:15:59'),
(5, 6, '333', 'root', 'Admin', '3123456789', '2025-04-17 09:16:15', '2025-04-17 09:16:15'),
(6, 7, '444', 'prueba', 'Admin', '3123456789', '2025-04-17 09:17:27', '2025-04-17 09:17:27'),
(7, 8, '555', 'example', 'Admin', '3123456789', '2025-04-17 09:18:35', '2025-04-17 09:18:35'),
(8, 9, '1000576803', 'Brian', 'Beltran', '3208332507', '2025-04-17 09:19:38', '2025-04-17 09:19:38'),
(10, 17, '666', 'xd', 'xd', '3323456789', '2025-06-07 05:30:18', '2025-06-07 05:30:18');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel_cache_4oWEsM4RR4DRhfeY', 's:7:\"forever\";', 2060382594),
('laravel_cache_7gRUmkz00OPZZKgf', 's:7:\"forever\";', 2059152071),
('laravel_cache_aabrs4rvTWJ6kZBg', 's:7:\"forever\";', 2064615335),
('laravel_cache_AFNKLXpfBd26fzQx', 's:7:\"forever\";', 2064535360),
('laravel_cache_AReXyj4kYqJdcjcY', 's:7:\"forever\";', 2060714898),
('laravel_cache_bJwwOZI2tzolxwSW', 's:7:\"forever\";', 2060386365),
('laravel_cache_ByoXLYyzWKSJrrlM', 's:7:\"forever\";', 2064616267),
('laravel_cache_cyl9COiMrypnF78M', 's:7:\"forever\";', 2064613536),
('laravel_cache_fZsGXw1nmzOkUx31', 's:7:\"forever\";', 2064535303),
('laravel_cache_gOChOq4igLmEwcYj', 's:7:\"forever\";', 2060383641),
('laravel_cache_H1mqehe3VtwExLnB', 's:7:\"forever\";', 2060716995),
('laravel_cache_HBinDDDipPGGy9c5', 's:7:\"forever\";', 2060716723),
('laravel_cache_HnPl39fE7eX86Ebd', 's:7:\"forever\";', 2064535319),
('laravel_cache_igUPQdxB1IFc02t6', 's:7:\"forever\";', 2060717025),
('laravel_cache_l0Qq491XCV7DzSwT', 's:7:\"forever\";', 2064618001),
('laravel_cache_mWgO1wv9TUuwrfpP', 's:7:\"forever\";', 2060386390),
('laravel_cache_NDjJn2hkQzNT965L', 's:7:\"forever\";', 2062716429),
('laravel_cache_o5Fg6QtCpbsGb6s5', 's:7:\"forever\";', 2064613480),
('laravel_cache_OKlXN9Wv4ti2Eum5', 's:7:\"forever\";', 2060715333),
('laravel_cache_skS856i6tlcga6I8', 's:7:\"forever\";', 2064534732),
('laravel_cache_sKZd3K2gCb4hE094', 's:7:\"forever\";', 2064536659),
('laravel_cache_TvixvoDTSyzNlrpw', 's:7:\"forever\";', 2064535245),
('laravel_cache_tyNYZ0PZTWhhJ5FD', 's:7:\"forever\";', 2060715012),
('laravel_cache_W1fNgjXVCqsJkC5i', 's:7:\"forever\";', 2064616294),
('laravel_cache_WcICrVdNH1wSEhyD', 's:7:\"forever\";', 2060716676),
('laravel_cache_X3mQd056UqagrUOn', 's:7:\"forever\";', 2059151402),
('laravel_cache_xcNFkxZ4PdqJu16f', 's:7:\"forever\";', 2066343343),
('laravel_cache_Y8R8MK0tVymgjAnY', 's:7:\"forever\";', 2064617668);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito`
--

CREATE TABLE `carrito` (
  `idCarrito` int(10) NOT NULL,
  `idCliente` int(10) DEFAULT NULL,
  `guest_id` char(36) DEFAULT NULL,
  `idProducto` int(10) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `carrito`
--

INSERT INTO `carrito` (`idCarrito`, `idCliente`, `guest_id`, `idProducto`, `cantidad`, `created_at`, `updated_at`) VALUES
(2, NULL, 'c88a0247-0fa3-4776-9644-f733e225e16e', 2, 1, '2025-06-27 05:15:46', '2025-06-27 05:15:46');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `idCategoria` int(11) NOT NULL,
  `nombreCategoria` varchar(45) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`idCategoria`, `nombreCategoria`, `created_at`, `updated_at`) VALUES
(1, 'BOARDS', '2025-04-03 18:23:05', '2025-04-17 02:19:44'),
(2, 'MEMORIA RAM', '2025-04-17 02:17:53', '2025-04-17 02:17:53'),
(3, 'ALMACENAMIENTO', '2025-04-17 02:17:53', '2025-04-17 02:17:53'),
(4, 'TARJETA GRAFICA', '2025-04-17 02:17:53', '2025-04-17 02:17:53'),
(5, 'MONITORES', '2025-04-17 02:17:53', '2025-04-17 02:17:53'),
(6, 'PERIFERICOS', '2025-04-17 02:17:53', '2025-04-17 02:17:53'),
(7, 'PROCESADORES', '2025-04-17 02:19:32', '2025-04-17 02:19:32'),
(8, 'FUENTES', '2025-04-17 02:19:32', '2025-04-17 02:19:32'),
(9, 'TECLADOS', '2025-04-17 02:20:42', '2025-04-17 02:20:42'),
(10, 'MOUSE', '2025-04-17 02:20:42', '2025-04-17 02:20:42'),
(11, 'AMD', '2025-04-17 02:23:19', '2025-04-17 02:23:19'),
(12, 'INTEL', '2025-04-17 02:23:19', '2025-04-17 02:23:19'),
(13, 'VENTILADORES', '2025-04-17 02:24:04', '2025-04-17 02:24:04'),
(14, 'DISIPADORES', '2025-04-17 02:24:04', '2025-04-17 02:24:04'),
(15, 'CHASIS', '2025-04-17 02:25:28', '2025-04-17 02:25:28'),
(16, 'DIADEMAS', '2025-04-17 02:25:28', '2025-04-17 02:25:28'),
(17, 'MICROFONOS', '2025-04-17 02:26:43', '2025-04-17 02:26:43'),
(18, 'CAMARAS', '2025-04-17 02:26:43', '2025-04-17 02:26:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoriaproducto`
--

CREATE TABLE `categoriaproducto` (
  `idProducto` int(11) NOT NULL,
  `idCategoria` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoriaproducto`
--

INSERT INTO `categoriaproducto` (`idProducto`, `idCategoria`) VALUES
(1, 1),
(2, 3),
(3, 8),
(4, 8),
(5, 7),
(5, 12),
(6, 7),
(6, 12),
(7, 6),
(7, 9),
(8, 6),
(8, 10),
(9, 7),
(9, 11),
(10, 7),
(10, 11),
(11, 1),
(12, 1),
(13, 1),
(14, 1),
(15, 15),
(16, 15),
(17, 15),
(18, 5),
(19, 5),
(20, 5),
(21, 6),
(21, 9);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `idCliente` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `cedulaCliente` varchar(20) NOT NULL,
  `nombreCliente` varchar(45) NOT NULL,
  `apellidoCliente` varchar(45) NOT NULL,
  `telefonoCliente` varchar(15) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`idCliente`, `idUsuario`, `cedulaCliente`, `nombreCliente`, `apellidoCliente`, `telefonoCliente`, `direccion`, `created_at`, `updated_at`) VALUES
(1, 2, '123456789', 'Juana', 'Pérez', '3216549870', 'Calle 123 #45-67', '2025-04-03 23:21:12', '2025-04-19 06:48:10'),
(3, 11, '1032457896', 'Laura', 'Gómez', '3102589631', 'Carrera 45 #12-34', '2025-04-19 05:26:47', '2025-04-19 05:26:47'),
(4, 12, '1098456231', 'Carlos', 'Ramírez', '3117894562', 'Calle 89 #56-78', '2025-04-19 05:27:31', '2025-04-19 05:27:31'),
(5, 13, '1012365478', 'Diana', 'Martínez', '3134567890', 'Avenida 3 #23-90', '2025-04-19 05:27:41', '2025-04-19 05:27:41'),
(6, 14, '1054678921', 'Andrés', 'López', '3001234567', 'Transversal 7 #65-12', '2025-04-19 05:27:47', '2025-04-19 05:27:47'),
(10, 15, '1561651', 'prueba', 'test', '3216508947', 'KR 53 C 128 19', '2025-04-23 01:39:15', '2025-04-23 01:39:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura`
--

CREATE TABLE `factura` (
  `idfactura` int(11) NOT NULL,
  `idPedido` int(11) NOT NULL,
  `fechaFactura` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `marca`
--

CREATE TABLE `marca` (
  `idMarca` int(11) NOT NULL,
  `nombreMarca` varchar(45) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `marca`
--

INSERT INTO `marca` (`idMarca`, `nombreMarca`, `created_at`, `updated_at`) VALUES
(1, 'ASUS', '2025-04-03 18:24:48', '2025-06-05 05:52:01'),
(2, 'MSI', '2025-04-17 02:07:55', '2025-04-17 02:07:55'),
(3, 'GIGABYTE', '2025-04-17 02:07:55', '2025-04-17 02:07:55'),
(4, 'CORSAIR', '2025-04-17 02:10:15', '2025-04-17 02:10:15'),
(5, 'KINGSTON', '2025-04-17 02:10:15', '2025-04-17 02:10:15'),
(6, 'LG', '2025-04-17 02:11:52', '2025-04-17 02:11:52'),
(7, 'ACER', '2025-04-17 02:11:52', '2025-04-17 02:11:52'),
(8, 'LOGITECH', '2025-04-17 02:13:48', '2025-04-17 02:13:48'),
(9, 'REDRAGON', '2025-04-17 02:13:48', '2025-04-17 02:13:48'),
(10, 'TRUST', '2025-04-17 02:15:12', '2025-04-17 02:15:12'),
(11, 'NVIDIA', '2025-04-17 02:15:12', '2025-04-17 02:15:12'),
(12, 'THERMALTAKE', '2025-04-17 02:16:02', '2025-04-17 02:16:02'),
(13, 'INTEL', '2025-04-17 02:22:29', '2025-04-17 02:22:29'),
(14, 'AMD', '2025-04-17 02:22:29', '2025-04-17 02:22:29'),
(15, 'XPG', '2025-04-17 02:27:34', '2025-04-17 02:27:34'),
(16, 'DELL', '2025-04-17 02:27:34', '2025-04-17 02:27:34'),
(17, 'SanDisk ', '2025-04-17 02:32:46', '2025-04-17 02:32:46');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_03_26_214850_create_personal_access_tokens_table', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido`
--

CREATE TABLE `pedido` (
  `idPedido` int(11) NOT NULL,
  `idCliente` int(11) NOT NULL,
  `fechaPedido` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidoproducto`
--

CREATE TABLE `pedidoproducto` (
  `idProducto` int(11) NOT NULL,
  `idPedido` int(11) NOT NULL,
  `cantidadProducto` int(11) NOT NULL,
  `valorTotal` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `idProducto` int(11) NOT NULL,
  `nombreProducto` varchar(100) NOT NULL,
  `definicion` text NOT NULL,
  `idMarca` int(11) NOT NULL,
  `valorProducto` int(11) NOT NULL,
  `disponibilidad` tinyint(4) NOT NULL,
  `cantidadStock` int(11) NOT NULL,
  `idProveedor` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`idProducto`, `nombreProducto`, `definicion`, `idMarca`, `valorProducto`, `disponibilidad`, `cantidadStock`, `idProveedor`, `created_at`, `updated_at`) VALUES
(1, 'BOARD ASUS B550M-A AC WIFI', 'se hizo un cambio', 1, 542000, 1, 100, 1, '2025-04-03 18:25:16', '2025-06-26 23:51:57'),
(2, 'SanDisk Extreme Portable SSD 1TB', 'Tipo: SSD externo portátil\r\n\r\nInterfaz: USB-C 3.2 Gen 2 (10 Gbps)\r\n\r\nVelocidad de lectura: Hasta 1000 MB/s\r\n\r\nResistencia: Certificación IP65 (resistente al agua y polvo)\r\n\r\nCompatibilidad: PS5, PC, Mac', 17, 600000, 1, 100, 1, '2025-04-17 02:34:18', '2025-06-26 23:52:19'),
(3, 'Thermaltake Smart BX1 650W 80+ Bronze', 'Potencia: 650W\r\n\r\nCertificación: 80 Plus Bronze\r\n\r\nConectores: 24 pines x1, 4+4 pines x1, SATA x6, PCI-E x2, periférico x4, FDD x1\r\n\r\nVentilador: 120mm silencioso', 12, 345000, 1, 100, 1, '2025-04-17 02:41:08', '2025-06-26 23:52:19'),
(4, 'XPG PYLON 650W 80+ Bronze', 'Potencia: 650W\n\nCertificación: 80 Plus Bronze\n\nConectores: SATA x12, PCI-E x4, HDD x12, Floppy x1', 15, 350000, 1, 100, 1, '2025-04-17 02:41:08', '2025-06-26 23:52:19'),
(5, 'Intel Core i5-12400F (12ª Gen)', 'Núcleos/Hilos: 6 núcleos, 12 hilos\n\nFrecuencia base: 2.5 GHz\n\nFrecuencia turbo: Hasta 4.4 GHz\n\nCaché: 18 MB Intel Smart Cache\n\nSocket: LGA 1700\n\nGráficos integrados: No\n\nIncluye disipador: Sí', 13, 590000, 1, 100, 1, '2025-04-17 02:41:08', '2025-06-26 23:52:19'),
(6, 'Intel Core i5-13400 (13ª Gen)', 'Núcleos/Hilos: 10 núcleos (6 Performance + 4 Efficient), 16 hilos\r\n\r\nFrecuencia base: 2.5 GHz\r\n\r\nCaché: 20 MB Intel Smart Cache\r\n\r\nSocket: LGA 1700\r\n\r\nGráficos integrados: Sí', 13, 1060000, 1, 100, 1, '2025-04-17 02:41:08', '2025-06-26 23:52:19'),
(7, 'Teclado Mecánico Redragon Kumara K552', 'Tipo: Mecánico\r\n\r\nSwitches: Outemu Blue (clicky)\r\n\r\nRetroiluminación: LED rojo\r\n\r\nConstrucción: Placa superior metálica\r\n\r\nConectividad: USB', 9, 150000, 1, 100, 1, '2025-04-17 02:41:08', '2025-06-26 23:52:19'),
(8, 'Mouse Logitech G203 Lightsync', 'DPI: Hasta 8,000\r\n\r\nIluminación: RGB personalizable\r\n\r\nBotones programables: 6\r\n\r\nConectividad: USB\r\n\r\n', 8, 120000, 1, 100, 1, '2025-04-17 02:41:08', '2025-06-26 23:52:19'),
(9, 'AMD Ryzen 5 5600X', 'Núcleos / Hilos: 6 núcleos / 12 hilos\r\n\r\nFrecuencia base / turbo: 3.7 GHz / hasta 4.6 GHz\r\n\r\nCaché: 32 MB L3\r\n\r\nSocket: AM4\r\n\r\nTDP: 65W\r\n\r\nGráficos integrados: No\r\n\r\nIncluye disipador: Sí, AMD Wraith Stealth', 14, 700000, 1, 100, 1, '2025-04-17 02:41:08', '2025-06-26 23:52:19'),
(10, 'AMD Ryzen 7 5800X', 'Núcleos / Hilos: 8 núcleos / 16 hilos\r\n\r\nFrecuencia base / turbo: 3.8 GHz / hasta 4.7 GHz\r\n\r\nCaché: 32 MB L3\r\n\r\nSocket: AM4\r\n\r\nTDP: 105W\r\n\r\nGráficos integrados: No\r\n\r\nIncluye disipador: No', 14, 900000, 1, 100, 1, '2025-04-17 02:41:08', '2025-06-26 23:52:19'),
(11, 'BOARD GIGABYTE B650 AORUS ELITE AX WiFi 3GPU ', 'El rendimiento incomparable de las placas base GIGABYTE está garantizado por un diseño térmico innovador y optimizado para garantizar la mejor estabilidad de CPU, chipset, SSD y bajas temperaturas bajo carga completa de aplicaciones y rendimiento de juegos.\r\n\r\nLas placas base GIGABYTE incluyen varios software útiles e intuitivos para ayudar a los usuarios a controlar cada aspecto de la placa base y proporcionar efectos de iluminación personalizables con una estética excepcional que se adapta a su personalidad única.\r\n\r\nEl diseño Ultra Durable™ de GIGABYTE proporciona durabilidad al producto y un proceso de fabricación de alta calidad. Las placas base GIGABYTE utilizan los mejores componentes y refuerzan cada ranura para que cada una de ellas sea sólida y duradera.\r\n\r\nAMD Socket AM5: Compatible con procesadores AMD Ryzen™ serie 7000/ Ryzen™ 8000\r\nRendimiento incomparable: solución VRM digital doble de 14*+2+1 fases\r\nDDR5 de doble canal: 4 * DIMM SMD con compatibilidad con módulos de memoria AMD EXPO™ e Intel® XMP\r\nAlmacenamiento de próxima generación: 1 * conectores PCIe 5.0 x4 y 2 * PCIe 4.0 x4 M.2\r\nHeatpipe completamente cubierto y protección térmica M.2: para garantizar la estabilidad de energía VRM y el rendimiento de SSD 25110 PCIe 5.0 M.2\r\nEZ-Latch: Ranura PCIe x16 y conectores M.2 con liberación rápida y diseño sin tornillos\r\nRedes rápidas: LAN de 2,5 GbE y Wi-Fi 6E 802.11ax\r\nConectividad extendida: DP, HDMI, USB-C® posterior de 10 Gb/s, USB-C® frontal de 20 Gb/s\r\nSmart Fan 6: cuenta con múltiples sensores de temperatura y cabezales de ventilador híbridos con FAN STOP\r\nQ-Flash Plus: actualice el BIOS sin instalar la CPU, la memoria y la tarjeta gráfica', 3, 1109000, 0, 100, 1, '2025-04-22 01:16:21', '2025-06-26 23:52:19'),
(12, 'BOARD MSI A520M-A PRO Micro USB3,2 A.V.R Pcie', 'Las placas base MSI le permiten administrar velocidades y temperaturas para todos los ventiladores de su sistema y CPU. Total Fan Control le permite verificar las características de su sistema principal en una interfaz gráfica simplificada. También puede configurar hasta 4 objetivos de temperatura para la CPU y la placa base, que ajustarán las velocidades del ventilador automáticamente.\r\n\r\nLas placas base de la serie MSI PRO admiten los últimos estándares de almacenamiento, lo que permite a los usuarios conectar cualquier dispositivo de almacenamiento ultrarrápido. Una mayor eficiencia facilita su trabajo.\r\n\r\n \r\n\r\nCPU (soporte máximo): Admite procesadores de escritorio AMD Ryzen ™ de tercera generación y procesadores de escritorio AMD Ryzen ™ 4000 serie G.Socket: AMD Socket AM4.Chipset: Conjunto de chips AMD® A520.Memoria DDR4: Soporta DDR4 1866/2133/2400/2667/2800/2933/3000/3066/3200 MHz por JEDEC. Soporta DDR4 2667/2800/2933/3000/3066/3200/3466/3600/3733/3866/4000/4133/4266 / 4400/4600+ MHz por modo A-XMP OC\r\nCanal de memoria: Doble.Ranuras DIMM: 2.Memoria máxima (gb): 64.PCI-E X16: 1.PCI-E GEN: Gen3.PCI-E X1: 1.SATAIII: 4.Ranura M.2: 1.Redada: 0/1/10.TPM (encabezado): 1.LAN: 1x Realtek® RTL8111H Gigabit LAN.Puertos USB 3.2 (frontales): 2 (Gen 1, Tipo A).Puertos USB 3.2 (traseros): 4 (Gen 1, Tipo A).Puertos USB 2.0 (frontales): 4.Puertos USB 2.0 (traseros): 2 (tipo A).Puertos seriales (frontales): 1.Puertos de audio (traseros): Códec Realtek® ALC892 / ALC897.DVI-D: 1.HDMI: 1.Directx: 12.', 2, 325000, 1, 100, 1, '2025-04-22 01:16:21', '2025-06-26 23:52:19'),
(13, 'Board Gigabyte A520m Ds3h Ac Wifi A.V.R Pciex', 'El rendimiento incomparable de las placas base GIGABYTE está garantizado por un diseño térmico innovador y optimizado para garantizar la mejor estabilidad de CPU, chipset, SSD y bajas temperaturas bajo carga completa de aplicaciones y rendimiento de juegos.\r\n\r\nLas placas base GIGABYTE incluyen varios software útiles e intuitivos para ayudar a los usuarios a controlar cada aspecto de la placa base y proporcionar efectos de iluminación personalizables con una estética excepcional que se adapta a su personalidad única.\r\n\r\nEl diseño Ultra Durable™ de GIGABYTE proporciona durabilidad al producto y un proceso de fabricación de alta calidad. Las placas base GIGABYTE utilizan los mejores componentes y refuerzan cada ranura para que cada una de ellas sea sólida y duradera.\r\n\r\nAMD Socket AM5: Compatible con procesadores AMD Ryzen™ serie 7000/ Ryzen™ 8000', 3, 449000, 1, 100, 1, '2025-04-22 01:19:46', '2025-06-26 23:52:19'),
(14, 'Board Gigabyte Z890 Gaming X Wifi 3gpu Pci 5', 'Admite procesadores Intel® Core™ Ultra (serie 2)\r\nSolución VRM de 16+1+2 fases de gemelo digital\r\nD5 Bionic Corsa para un rendimiento de memoria infinito\r\nAI Perfdrive : proporciona un perfil preestablecido de BIOS óptimo y personalizado para los usuarios\r\nCompatibilidad Premium : 4*DDR5 con soporte para módulo de memoria XMP\r\nWIFI EZ-Plug : Diseño rápido y sencillo para la instalación de antenas Wi-Fi\r\nEZ-Latch Plus : ranuras PCIe y M.2 con liberación rápida y diseño sin tornillos\r\nEZ-Latch Click : Disipadores de calor M.2 con diseño sin tornillos\r\nEnlace del panel del sensor : puerto de video integrado para una configuración sin complicaciones del panel en el chasis\r\nInterfaz de usuario amigable : múltiples temas, control de ventilador AIO y escaneo automático Q-Flash en BIOS y SW\r\nNuevo monitor de energía en HWinfo para la monitorización en tiempo real de las fases de energía de la CPU\r\nAlmacenamiento ultrarrápido : 4 ranuras M.2, incluida 1 PCIe 5.0 x4\r\nProtección térmica eficiente : VRM Thermal Armor Advanced y M.2 Thermal Guard\r\nRedes rápidas : LAN de 2,5 GbE y Wi-Fi 7 con antena direccional de ganancia ultraalta\r\nConectividad extendida : USB4 Tipo-C con DP-Alt, DisplayPort\r\nRanura PCIe UD X : ranura PCIe 5.0 x16 con potencia 10X para tarjeta gráfica', 3, 1339000, 1, 100, 1, '2025-04-22 01:19:46', '2025-06-26 23:52:19'),
(15, 'Caja Xpg Defender Pro Negra Vidrio Templado + 3 Fan Argb', 'Dimensiones (AL x AN x FO): 492 x 220 x 441 mm (19,37 x 8,66 x 17,36 pulgadas).Color: Exterior e interior: Negro.Material: SGCC.Paneles laterales: Panel lateral de vidrio templado de 3 mm.Factor de forma: Mini-ITX, Micro-ATX, ATX, E-ATX, CEB, EEB.Bandeja para unidades de disco duro y de estado sólido de 3,5″: 2.Bandeja para unidades de disco duro y de estado sólido de 2,5″: 2+2 (3,5”/2,5”combinado).Puerto de E/S: 2 USB 3.0, 1 puerto de audio híbrido, 1 botón de control de LED.Ventilador incluido: ARTE FRONTAL: 2 Ventilador ARGB de 120 mm XPG VENTO, ARTE TRASERA: 1 Ventilador ARGB de 120 mm XPG VENTO.\r\nSoporte del ventilador:\r\n\r\nLado frontal: 120mm x3, 140mm x2\r\nLado superior: 120mm x2, 140mm x2\r\nLado trasero: 120mm x1\r\nSoporte del radiador:\r\n\r\nLado frontal: 360 / 280 / 240mm x1\r\nLado superior: 280 / 240 / 120mm x1\r\nLado trasero: 120mm x1\r\nDistancia de seguridad:\r\n\r\nLimitación de la altura del refrigerador de la CPU: 170mm\r\nLimitación longitud de la tarjeta gráfica: 380mm\r\nLimitación de instalación vertical de la tarjeta gráfica: 27,3 mm\r\nLimitación de longitud de la unidad de fuente de alimentación: 220mm', 15, 405000, 1, 100, 1, '2025-04-22 01:26:09', '2025-06-26 23:52:19'),
(16, 'Caja Xpg Invader X Negra Vidrio Templado + 5 Argb + Riser 4.0', 'Dimensiones (AL x AN x FO): 448 x 245 x 475 mm (17,64 x 9,65 x 18,70 pulg)\r\n\r\nColor: Negro\r\n\r\nMaterial: SPCC/ Vidrio templado de 3mm\r\n\r\nFactor de forma: ATX, Micro-ATX, Mini-ITX\r\n\r\nBandeja para unidades de disco duro y de estado sólido de 3.5″: 3 (HDD de 3,5″ o SSD de 2,5″)\r\n\r\nPuerto de E/S: USB 3.2 Tipo-C x 1, USB 3.2 Tipo-A x 2, Puerta de Áudio HD x 1, Interruptor x 1, Botón de reinicio x 1\r\n\r\nVentilador incluido: 5 x 120 mm (opcional según modelo), (4 ventiladores invertidos + 1 ventilador normal)\r\n\r\nSoporte del ventilador:\r\n\r\nTRASERO :120mm x 1 / 140mm x 1\r\nSUPERIOR:120 mm x 3 / 140 mm x 2\r\nLateral:120mm x 3\r\nInferior: 120mm x 1 / 140mm x 1\r\nProtector de PSU :120mm x 2\r\nSoporte del radiador:\r\n\r\nTRASERO:120mm\r\nSUPERIOR: Hasta 360mm\r\nLateral: Hasta 360mm (Sólo montaje vertical de la GPU)\r\nDistancia de seguridad:\r\n\r\nTarjeta gráfica:\r\n\r\n400mm (Montaje GPU vertical / horizontal sin radiador lateral)\r\n270 mm (montaje horizontal de GPU con radiador lateral) instalación vertical de la tarjeta gráfica: 30.5mm Altura del enfriador de la CPU: hasta 175 mm\r\nLongitud de la fuente de alimentación (PSU): hasta 240 mm', 15, 709000, 1, 100, 1, '2025-04-22 01:26:09', '2025-06-26 23:52:19'),
(17, 'Caja Corsair 2500x Vidrio Templado No Fan Blanca', 'El chasis para PC de dos cámaras semitorre CORSAIR 2500X ofrece un flujo de aire y refrigeración excepcionales con paneles completamente de malla y un diseño de doble cámara lograr un diseño organizado e impresionante.\r\n\r\nDos cámaras para un aspecto estilizado\r\nMuchas opciones de personalización\r\nCompatibilidad con placas base mATX y mITX de conector inverso\r\nAmplia flexibilidad de refrigeración\r\nLibertad de elección tanto en el interior como en el exterior. Elija su diseño de refrigeración: opte por más cristal para mostrar sus componentes o un diseño de flujo de aire más sutil, en algo más que blanco o negro.\r\n\r\nLa 2500 Series puede albergar un PC potente con un tamaño impresionantemente pequeño. Asegúrese de que su diseño esté despejado, organizado y bien refrigerado en la cámara principal mientras oculta la guía para cables, las unidades de almacenamiento y la fuente de alimentación en la segunda cámara.\r\n\r\nAproveche la compatibilidad de la placa base con conector inverso (ASUS BTF, MSI PROJECT ZERO) e iCUE LINK y gane la guerra a los cables de una vez por todas.\r\n\r\nEl 2500X no solo tiene un diseño alucinante. Los soportes para ventiladores y radiadores alrededor garantizan un flujo de aire suficiente para cualquier diseño emblemático.\r\n\r\nPersonalice su configuración de refrigeración gracias al espacio para hasta 9 ventiladores de 120 mm o 6 de 140 mm. Incluye opciones versátiles de montaje de radiadores de hasta 240 mm en el lateral y hasta 360 mm en la parte superior e inferior.\r\n\r\n \r\n\r\nAltura de la caja: 376\r\n\r\nDuración del caso: 469\r\n\r\nAncho de caja: 304\r\n\r\nMaterial: Acero, vidrio templado, plástico.\r\n\r\nSoporte de placa base: Mini-ITX, Micro-ATX\r\n\r\nColor: Blanco\r\n\r\nPeso: 13.39\r\n\r\nCompatibilidad del radiador: 120 mm, 140 mm, 240 mm, 280 mm, 360 mm\r\n\r\nLongitud máxima de GPU: 400 mm\r\n\r\nAltura máxima del enfriador de CPU: 180 mm\r\n\r\nLongitud máxima de la fuente de alimentación: 225 mm\r\n\r\nRefrigeradores líquidos compatibles: H60, H100i, H115i, H150i (todas las series)\r\n\r\nTamaño de la caja: Torre intermedia\r\n\r\nFuente de alimentación de caja: ATX\r\n\r\nRanuras de expansión de la caja: 4 horizontales (4 verticales con accesorio)\r\n\r\nCaja frontal IO: (1x) USB 3.2 Gen 2 Tipo-C, (2x) USB 3.2 Gen 1 Tipo-A, (1x) Entrada/salida de audio\r\n\r\nVentana de caja: Vidrio templado\r\n\r\nBahías de unidad internas de 3,5″: 2\r\n\r\nBahías de unidad internas de 2,5″: 2\r\n\r\nSoporte del radiador – Superior: 360 mm, 280 mm, 240 mm\r\n\r\nSoporte de radiador delantero: Ninguno (Panel de vidrio)\r\n\r\nSoporte del radiador – inferior: 360 mm, 280 mm, 240 mm\r\n\r\nSoporte de radiador – lateral: 240 mm\r\n\r\nSoporte del radiador trasero: 120 mm\r\n\r\nSoporte de los fans – Top: 3 x 120 mm, 3 x 140 mm\r\n\r\nSoporte de ventilador – Delantero: Ninguno (Panel de vidrio)\r\n\r\nSoporte para ventiladores – Parte inferior: 3 x 120 mm, 3 x 140 mm\r\n\r\nSoporte de ventilador – Lateral: 2×120 mm\r\n\r\nSoporte de ventilador – Trasero: 1×120 mm\r\n\r\nConexiones de E/S frontales de la placa base: 1x audio HD; 1x USB 3.2 Gen1; 1x USB-3.2 Gen2 Tipo-E; 1x F_PANEL\r\n\r\nSoporte para placa base con conector inverso: Sí\r\n\r\nFiltración de polvo: Sí\r\n\r\nEspacio para enrutamiento de cables: 106 mm\r\n\r\nRapidRoute incluido: Compatible (se vende por separado)\r\n\r\nPanel lateral izquierdo: Vidrio templado\r\n\r\nPanel lateral derecho: Malla', 4, 695000, 1, 100, 1, '2025-04-22 01:30:04', '2025-06-26 23:52:19'),
(18, 'Monitor Led Lg 34″ 2k Curvo Wqhd 160hz Hdr Pivot 34gp63a-B', 'Una velocidad rápida de 160 Hz permite a los jugadores ver el siguiente cuadro rápidamente y hace que la imagen aparezca sin problemas. Los jugadores pueden responder rápidamente a los oponentes y apuntar al objetivo fácilmente.\r\n\r\n1 ms MBR ayuda a suavizar el juego, reduciendo el desenfoque y el efecto fantasma. Los objetos dinámicos y de ritmo rápido en medio de toda la acción pueden dar a los jugadores una ventaja competitiva.\r\n\r\nCon la tecnología FreeSync™ Premium, los jugadores pueden experimentar un movimiento fluido y continuo en juegos de alta resolución y ritmo rápido. Prácticamente reduce el desgarro y el tartamudeo de la pantalla.\r\n\r\nEste monitor admite un amplio espectro de colores, el 99% de la gama de colores sRGB, expresando colores de alta fidelidad para reproducir con HDR10, lo que permite una inmersión visual realista. Independientemente del campo de batalla, puede ayudar a los jugadores a ver los colores dramáticos que pretendían los desarrolladores del juego.\r\n\r\nEsta pantalla optimizada cuenta con un bisel delgado en tres lados y sin distracciones de la imagen deslumbrantemente precisa y realista, mientras que los parlantes estéreo de 7 W con MaxxAudio® completan su experiencia de juego inmersiva.', 6, 2149000, 1, 100, 1, '2025-04-22 01:30:04', '2025-06-26 23:52:19'),
(19, 'Monitor Led Asus 32″ Tuf Gaming Vg32vq1b', 'La tecnología ASUS Extreme Low Motion Blur (ELMB ™) permite un tiempo de respuesta de 1 ms (MPRT) junto con Adaptive-sync, eliminando las imágenes fantasmas y el desgarro para obtener imágenes de juego nítidas con altas velocidades de cuadro.\r\n\r\nTecnología FreeSync Premium compatible a través de puertos DP y HDMI que brindan frecuencias de actualización variables para baja latencia, sin tartamudeos y sin desgarros mientras se juega.\r\n\r\nShadow Boost mejora los detalles de la imagen en áreas oscuras, iluminando escenas sin sobreexponer áreas brillantes.', 1, 1415000, 1, 100, 1, '2025-04-22 01:34:24', '2025-06-26 23:52:19'),
(20, 'Monitor Led Gigabyte 27″ Ssips Qhd 1ms-240Hz M27qx-Sa Ajustable', 'Como reproductor invisible, el monitor suele subestimarse. La verdad es que los monitores funcionan como un efecto sinérgico y sacan el máximo rendimiento de los componentes de PC. Los monitores para juegos de GIGABYTE ofrecen las mejores especificaciones y calidad, y los usuarios pueden disfrutar de un rendimiento de primera clase sin necesidad de extravagancias.\r\n\r\nLa función KVM le permite controlar varios dispositivos a través de un conjunto de teclado, video y mouse. Con nuestro botón KVM exclusivo, ¡cambiar de dispositivos no puede ser más fácil! ¡Es tan rápido como un chasquido!\r\n\r\nAlta resolución y frecuencia de actualización rápida, que le brinda una calidad de visualización detallada y una experiencia de juego fluida.\r\n\r\nLa compatibilidad con DisplayPort High Bit Rate 3 (HBR3) proporciona el ancho de banda para ofrecer la frecuencia de actualización más rápida del monitor, profundidad de color completa y efecto HDR al mismo tiempo.\r\n\r\nLa apariencia aerodinámica representa la simplicidad de la filosofía de diseño de la serie de juegos GIGABYTE, un soporte resistente y un acabado mate diseñados para características funcionales y estéticas que agregan más características.', 3, 2029000, 1, 100, 1, '2025-04-22 01:34:24', '2025-06-26 23:52:19'),
(21, 'Teclado Touch Inalámbrico Logitech K400 Smart Tv', 'Disfruta de un control simplificado de tu sistema multimedia PC a TV, sin los inconvenientes de tener el teclado y el ratón por separado.Las teclas cómodas y silenciosas, así como el amplio touchpad (9 cm o 3,5 in), te permiten navegar con total facilidad.\r\n\r\nVe vídeos, navega en Internet, habla con tus amigos y mucho más sin molestas demoras o interrupciones.\r\n\r\nCon K400 Plus, te sentirás cómodo al instante. La distribución está diseñada para una interacción multimedia relajada.\r\n\r\nUsa K400 Plus nada más sacarlo de la caja, o personaliza la configuración de las teclas y el touchpad con el software Logitech Options.\r\n\r\n \r\n\r\nDimensiones:\r\nGeneral:\r\n\r\nAltura: 139,9 mm\r\nAnchura: 354,3 mm\r\nProfundidad: 23,5 mm\r\nPeso: 380 g (con pilas)\r\n Touchpad\r\n\r\nAltura: 76 mm\r\nAnchura: 47 mm\r\nRequisitos del sistema:\r\nWindows® 7, Windows 8, Windows 10 o posterior\r\nAndroid™ 5.0 o posterior\r\nChrome OS™\r\nPuerto USB\r\nEspecificaciones:\r\nTipo de conexión: Protocolo Logitech Unifying (2,4 GHz)\r\nBotones/Teclas especiales: Silencio y ajuste de volumen\r\nConexión/Encendido: Conmutador de encendido/apagado\r\nDetalles de las pilas: 2 pilas AA\r\nDuración de las pilas (no recargables): Hasta 18 meses\r\nDuración de las teclas: Hasta 5 millones de pulsaciones\r\nRuido al escribir: Hasta 55 dBA para todas las teclas\r\nRadio de acción inalámbrico: 10 m', 8, 155000, 1, 100, 1, '2025-04-22 01:34:24', '2025-06-26 23:52:19');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedor`
--

CREATE TABLE `proveedor` (
  `idProveedor` int(11) NOT NULL,
  `nombreProveedor` varchar(45) NOT NULL,
  `emailProveedor` varchar(45) NOT NULL,
  `telefonoProveedor` varchar(15) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedor`
--

INSERT INTO `proveedor` (`idProveedor`, `nombreProveedor`, `emailProveedor`, `telefonoProveedor`, `created_at`, `updated_at`) VALUES
(1, 'PC SYSTEMS', 'pcsystems@gmail.com', '43256442', '2025-04-03 18:24:30', '2025-04-03 18:24:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `idRol` int(11) NOT NULL,
  `nombreRol` varchar(45) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`idRol`, `nombreRol`, `created_at`, `updated_at`) VALUES
(1, 'Cliente', '2025-04-03 23:05:43', '2025-04-03 23:05:43'),
(2, 'Admin', '2025-04-03 23:07:07', '2025-04-03 23:07:07'),
(3, 'SuperAdmin', '2025-04-04 20:22:00', '2025-04-04 20:22:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('tbdpipsDTwD4NwdIyNMFqiea1h6S63gdLqcVkVxD', 1, '127.0.0.1', 'PostmanRuntime/7.43.3', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZjdKNlVLZk1tQUI0dndhSnQ5OXM5OHRCNk1EOWpzYmtCQ3d6dmI1bSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1745030269);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `idUsuario` int(11) NOT NULL,
  `email` varchar(45) NOT NULL,
  `password` varchar(255) NOT NULL,
  `idRol` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`idUsuario`, `email`, `password`, `idRol`, `created_at`, `updated_at`) VALUES
(1, 'admin@admin.com', '$2y$12$wfH0WPh15EojpatD1Aw16.ojASF9fxKHvtDkqjxywm65XPmVLtOlG', 3, '2025-04-03 23:20:37', '2025-04-19 01:58:18'),
(2, 'perez@example.com', '$2y$12$rozrV6l6Bwna3DOpqk/JSe6NKh42kLP1jsVmmITzhVrNFyuVsQZG6', 1, '2025-04-03 23:21:12', '2025-04-03 23:21:12'),
(3, 'mini@prueba.com', '$2y$12$lcffKjB0j0L3EresvAfV6eHA9pnZG0c3IY2w1uAbC0jL2m4tHI/xS', 2, '2025-04-05 05:18:29', '2025-04-17 04:30:42'),
(4, 'super@admin.com', '$2y$12$Onsw.X2agETWFQBUqOuf/uP7maqxALWBz4MtjPA7pfY8BZLuV20yG', 3, '2025-04-17 09:13:27', '2025-04-17 09:24:56'),
(5, 'master@admin.com', '$2y$12$tFtTVnt/buBkQZ6hxrw6aOOaXcaKarj2rL0bdzKmbNw5T4MR2R8Jq', 3, '2025-04-17 09:15:59', '2025-04-17 09:25:10'),
(6, 'root@prueba.com', '$2y$12$ZyZqk9dvfQsnYXHZOI3X4Oe9QP1Cb6Ib/O8bhfobUZzTQRxo/PWT6', 2, '2025-04-17 09:16:15', '2025-04-17 04:30:33'),
(7, 'ex@prueba.com', '$2y$12$9pr1ONU0v2u9jT6EDetDn.eYo3rZ5Nm/nVoE2PVMde1YGSwonDmOq', 2, '2025-04-17 09:17:27', '2025-04-19 06:58:22'),
(8, 'example@prueba.com', '$2y$12$sYvQuOqHUX0uev9.93uxPuORj1FCYqUslBh9QlbT3I1.JmOwm5bVi', 2, '2025-04-17 09:18:35', '2025-04-17 09:18:35'),
(9, 'babeltranp@gmail.com', '$2y$12$NDlsswFkKy5D0FO9X7bFTeN4hsGgRQDdcCE9a0qD1EqwY/7j/Yl4i', 3, '2025-04-17 09:19:38', '2025-04-17 09:25:20'),
(11, 'laura.gomez@example.com', '$2y$12$Gf5rU5SEuCiQGxdWJ/7gPueXprxOZayG6ukPtuDAz45FAqKsZ0RC.', 1, '2025-04-19 05:26:47', '2025-04-19 05:26:47'),
(12, 'carlos.ramirez@example.com', '$2y$12$fdBCapflWa4fTGwgzlZnu.vWo6/YMrww.jMs36ObKDqQYrcDBFwIm', 1, '2025-04-19 05:27:31', '2025-04-19 05:27:31'),
(13, 'diana.martinez@example.com', '$2y$12$xTDU7R.MS.PdsxevXJC2je/jdwC.DWGBd/xUAfdOxaPwMxThq0XTm', 1, '2025-04-19 05:27:41', '2025-04-19 05:27:41'),
(14, 'andres.lopez@example.com', '$2y$12$3DbKeAMQrQnJdjGdkkSnUup8VvgAdfbI5vVjJJHfBCchHgppZapxO', 1, '2025-04-19 05:27:47', '2025-04-19 05:27:47'),
(15, 'test@prueba.com', '$2y$12$.Xm9mm.UNJE3qa6pF.ZePuJa5MjhHVKV8WQRM7gl9sEfeclthY8je', 1, '2025-04-23 01:39:15', '2025-04-23 01:39:15'),
(17, 'xd@gmail.com', '$2y$12$1CgUfDPiiilDBEujoyRal.rhBycbbgpiR8cCVrXnsimkrHvR/NQcS', 2, '2025-06-07 05:30:18', '2025-06-07 05:32:51');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`idAdmin`),
  ADD KEY `fk_admin_usuario1_idx` (`idUsuario`);

--
-- Indices de la tabla `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indices de la tabla `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indices de la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD PRIMARY KEY (`idCarrito`),
  ADD KEY `carrito_guest_id_index` (`guest_id`),
  ADD KEY `idCliente` (`idCliente`),
  ADD KEY `idProducto` (`idProducto`);

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`idCategoria`);

--
-- Indices de la tabla `categoriaproducto`
--
ALTER TABLE `categoriaproducto`
  ADD PRIMARY KEY (`idProducto`,`idCategoria`),
  ADD KEY `fk_producto_tienda_categoria_categoria1_idx` (`idCategoria`),
  ADD KEY `fk_producto_tienda_categoria_producto1_idx` (`idProducto`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`idCliente`),
  ADD KEY `fk_cliente_usuario1_idx` (`idUsuario`);

--
-- Indices de la tabla `factura`
--
ALTER TABLE `factura`
  ADD PRIMARY KEY (`idfactura`),
  ADD KEY `fk_factura_pedido1_idx` (`idPedido`);

--
-- Indices de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indices de la tabla `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indices de la tabla `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `marca`
--
ALTER TABLE `marca`
  ADD PRIMARY KEY (`idMarca`);

--
-- Indices de la tabla `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`idPedido`),
  ADD KEY `fk_pedido_cliente1_idx` (`idCliente`);

--
-- Indices de la tabla `pedidoproducto`
--
ALTER TABLE `pedidoproducto`
  ADD PRIMARY KEY (`idProducto`,`idPedido`),
  ADD KEY `fk_producto_tienda_pedido_pedido1_idx` (`idPedido`),
  ADD KEY `fk_producto_tienda_pedido_producto1_idx` (`idProducto`);

--
-- Indices de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`idProducto`),
  ADD KEY `fk_producto_marca1_idx` (`idMarca`),
  ADD KEY `fk_producto_proveedor1_idx` (`idProveedor`);

--
-- Indices de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  ADD PRIMARY KEY (`idProveedor`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`idRol`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`idUsuario`),
  ADD KEY `fk_usuario_rol1_idx` (`idRol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `admin`
--
ALTER TABLE `admin`
  MODIFY `idAdmin` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `carrito`
--
ALTER TABLE `carrito`
  MODIFY `idCarrito` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `idCategoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `idCliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `factura`
--
ALTER TABLE `factura`
  MODIFY `idfactura` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `marca`
--
ALTER TABLE `marca`
  MODIFY `idMarca` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `idPedido` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `idProducto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  MODIFY `idProveedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `idRol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `idUsuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `admin`
--
ALTER TABLE `admin`
  ADD CONSTRAINT `fk_admin_usuario1` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `carrito`
--
ALTER TABLE `carrito`
  ADD CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`idCliente`) REFERENCES `cliente` (`idCliente`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `carrito_ibfk_2` FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `categoriaproducto`
--
ALTER TABLE `categoriaproducto`
  ADD CONSTRAINT `fk_producto_tienda_categoria_categoria1` FOREIGN KEY (`idCategoria`) REFERENCES `categoria` (`idCategoria`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_producto_tienda_categoria_producto1` FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD CONSTRAINT `fk_cliente_usuario1` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `factura`
--
ALTER TABLE `factura`
  ADD CONSTRAINT `fk_factura_pedido1` FOREIGN KEY (`idPedido`) REFERENCES `pedido` (`idPedido`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `fk_pedido_cliente1` FOREIGN KEY (`idCliente`) REFERENCES `cliente` (`idCliente`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `pedidoproducto`
--
ALTER TABLE `pedidoproducto`
  ADD CONSTRAINT `fk_producto_tienda_pedido_pedido1` FOREIGN KEY (`idPedido`) REFERENCES `pedido` (`idPedido`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_producto_tienda_pedido_producto1` FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `fk_producto_marca1` FOREIGN KEY (`idMarca`) REFERENCES `marca` (`idMarca`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_producto_proveedor1` FOREIGN KEY (`idProveedor`) REFERENCES `proveedor` (`idProveedor`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_usuario_rol1` FOREIGN KEY (`idRol`) REFERENCES `rol` (`idRol`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
