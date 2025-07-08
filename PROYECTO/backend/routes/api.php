<?php
use App\Http\Controllers\usuarioController;
use App\Http\Controllers\adminController;
use App\Http\Controllers\categoriaController;
use App\Http\Controllers\clienteController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\marcaController;
use App\Http\Controllers\productoController;
use App\Http\Controllers\rolController;
use App\Http\Controllers\proveedorController;
use App\Http\Controllers\facturaController;
use App\Http\Controllers\pedidoController;
use App\Http\Controllers\carritoController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Route;

//use App\Http\Controllers\ForgotPasswordController;
//use App\Http\Controllers\ResetPasswordController;
///GLOBAL

Route::prefix('verProductos')->group(function () {
    Route::get('/', [productoController::class, 'index']);
    Route::get('/{id}', [productoController::class, 'show'])->where('id', '[0-9]+');
    Route::get('/home', [productoController::class, 'home']);
    Route::get('/marcas/{idMarca}', [productoController::class, 'productosPorMarca']);
});
Route::prefix('verMarcas')->group(function () {
    Route::get('/', [marcaController::class, 'index']);
    Route::get('/{id}', [marcaController::class, 'show'])->where('id', '[0-9]+');
});
Route::prefix('verCategorias')->group(function () {
    Route::get('/', [categoriaController::class, 'index']);
    Route::get('/{id}', [categoriaController::class, 'show'])->where('id', '[0-9]+');
});
/////////////////////////////////////////////////////////////////////////
///CLIENTE
Route::group([
    'middleware' => 'api',
    'prefix' => 'auth',
], function () {
    Route::post('/register/cliente', [AuthController::class, 'registerCliente']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:api');
    Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('auth:api');
    Route::get('/profile', [AuthController::class, 'profile'])->middleware('auth:api');
});

// Rutas protegidas para clientes (requieren autenticación)
Route::middleware(['auth:api', 'role:Cliente'])->prefix('clientes')->group(function () {
    Route::patch('/actualizar/cuenta', [clienteController::class, 'updatePartial']);
    Route::delete('/eliminar/cuenta', [clienteController::class, 'destroy']);
});
Route::middleware(['auth:api', 'role:Cliente'])->prefix('p')->group(function () {
    // Pedidos
    Route::post('/pedidos', [pedidoController::class, 'store']); // O 'store' si usas Resource
    Route::get('/pedidos', [pedidoController::class, 'index']); // Para obtener todos los pedidos (del usuario autenticado)
    Route::get('/pedidos/{id}', [pedidoController::class, 'show']);
    Route::get('/mis-productos-comprados', [pedidoController::class, 'getUserPurchaseItems']);
});
Route::middleware(['auth:api', 'role:Admin'])->prefix('admin')->group(function () {
    // Pedidos
    Route::get('/pedidos', [pedidoController::class, 'lista']); // Para obtener todos los pedidos (del usuario autenticado)
    Route::get('/pedidos/{id}', [pedidoController::class, 'show']);
});
/////////////////////////////////////////////////////////////////////////
///ADMIN
//Rutas protegidas para admin (requieren autenticación)
Route::middleware(['auth:api', 'role:Admin'])->prefix('admin')->group(function () {
    Route::patch('/actualizar/datos', [adminController::class, 'updatePartial']);
});

Route::middleware(['auth:api', 'role:Admin'])->prefix('consumidores')->group(function () {
    Route::get('/clientes', [clienteController::class, 'index']);
    Route::get('/clientes/{id}', [clienteController::class, 'show'])->where('id', '[0-9]+');
    Route::patch('/clientes/actualizar/{id}', [clienteController::class, 'actualizaCliente'])->where('id', '[0-9]+');
    Route::delete('/clientes/eliminar/{id}', [clienteController::class, 'eliminaCliente'])->where('id', '[0-9]+');
});

/////////////////////////////////////////////////////////////////////////
//Super Admin
//Rutas protegidas para Super admin (requieren autenticación)
Route::middleware(['auth:api', 'role:SuperAdmin'])->prefix('auth')->group(function () {
    Route::post('/register/admin', [AuthController::class, 'registerAdmin']);
});
Route::middleware(['auth:api', 'role:SuperAdmin'])->prefix('users')->group(function () {
    Route::get('/show', [adminController::class, 'index']);
    Route::get('/ver/admin/{id}', [adminController::class, 'show'])->where('id', '[0-9]+');
    Route::patch('/actualizar/admin/{id}', [adminController::class, 'actualizarAdmins'])->where('id', '[0-9]+'); // Actualización parcial puede cambiar rol
    Route::delete('/delete/admin/{id}', [adminController::class, 'destroy'])->where('id', '[0-9]+');
});
/////////ROL
Route::middleware(['auth:api', 'role:SuperAdmin'])->prefix('control')->group(function () {
    Route::post('/roles/registrar', [rolController::class, 'store']);
    Route::get('/roles', [rolController::class, 'index']);
    Route::get('/roles/{id}', [rolController::class, 'show'])->where('id', '[0-9]+');
    Route::patch('/roles/actualizar/{id}', [rolController::class, 'updatePartial'])->where('id', '[0-9]+'); // Actualización parcial
    Route::put('/roles/update/{id}', [rolController::class, 'updatePartial'])->where('id', '[0-9]+'); 
    Route::delete('/roles/eliminar/{id}', [rolController::class, 'destroy'])->where('id', '[0-9]+');
});
Route::middleware(['auth:api', 'role:SuperAdmin'])->group(function () {

    // Rutas para la gestión de USUARIOS y sus ROLES (operaciones sobre la tabla 'usuario')

    // Obtener la lista completa de usuarios con sus roles asociados
    // Esta ruta es la que usará `userService.getAllUsersWithRoles`
    Route::get('/usuarios-con-roles', [usuarioController::class, 'indexUsersWithRoles']);

    // Actualizar el rol de un usuario específico
    // Esta ruta es la que usará `userService.updateUserRole`
    Route::patch('/usuarios/{idUsuario}/actualizar-rol', [usuarioController::class, 'updateRol'])
        ->where('idUsuario', '[0-9]+');

    // Obtener los detalles de un usuario específico por ID
    // Esta ruta es la que usará `userService.getUserById` (si lo implementas en el frontend)
    Route::get('/usuarios/{idUsuario}', [usuarioController::class, 'show'])
        ->where('idUsuario', '[0-9]+');

    // Eliminar un usuario específico por ID
    // Esta ruta es la que usará `userService.deleteUser`
    Route::delete('/usuarios/{idUsuario}', [usuarioController::class, 'destroy'])
        ->where('idUsuario', '[0-9]+');

    // Ruta para solicitar el enlace de restablecimiento (la que usa tu frontend ahora)
});
///////////////////////////////////////////////////////////////////////
//PRODUCTOS
Route::middleware(['auth:api', 'role:Admin'])->prefix('productos')->group(function () {
    Route::get('/detalles', [productoController::class, 'detalles']);
    Route::post('/registrar', [productoController::class, 'store']);
    Route::patch('/actualizar/{id}', [productoController::class, 'updatePartial'])->where('id', '[0-9]+');
    Route::delete('/eliminar/{id}', [productoController::class, 'destroy'])->where('id', '[0-9]+');
    Route::get('/productos-bajo-stock', [productoController::class, 'getProductosBajoStock']); 
    // Rutas para la gestión de categorías de un producto
    Route::get('/{id}/categorias', [productoController::class, 'getProductCategories'])->where('id', '[0-9]+');
    Route::patch('/{id}/categorias', [productoController::class, 'syncProductCategories'])->where('id', '[0-9]+');
});
//CATEGORIAS
Route::middleware(['auth:api', 'role:Admin'])->prefix('categorias')->group(function () {
    Route::post('/registrar', [categoriaController::class, 'store']);
    Route::patch('actualizar/{id}', [categoriaController::class, 'updatePartial'])->where('id', '[0-9]+');
    Route::delete('/eliminar/{id}', [categoriaController::class, 'destroy'])->where('id', '[0-9]+');
});
//MARCAS
Route::middleware(['auth:api', 'role:Admin'])->prefix('marcas')->group(function () {
    Route::post('/registrar', [marcaController::class, 'store']);
    Route::patch('/actualizar/{id}', [marcaController::class, 'updatePartial'])->where('id', '[0-9]+');
    Route::delete('/eliminar/{id}', [marcaController::class, 'destroy'])->where('id', '[0-9]+');
});
///////////////////////////////////////////////////////////////////////
Route::middleware(['auth:api', 'role:Admin'])->prefix('proveedores')->group(function () {
    Route::get('/verProveedores', [proveedorController::class, 'index']);
    Route::get('/proveedores/{id}', [proveedorController::class, 'show'])->where('id', '[0-9]+');
    Route::post('/registrar', [proveedorController::class, 'store']);
    Route::patch('/actualizar/{id}', [proveedorController::class, 'updatePartial'])->where('id', '[0-9]+');
    Route::delete('/eliminar/{id}', [proveedorController::class, 'destroy'])->where('id', '[0-9]+');
});
// Carrito
Route::get('/carrito', [carritoController::class, 'index']);
Route::post('/carrito', [carritoController::class, 'store']);
Route::patch('/carrito/{idCarrito}', [carritoController::class, 'update']);
Route::delete('/carrito/{idCarrito}', [carritoController::class, 'destroy']);
Route::post('/carrito/vaciar', [carritoController::class, 'clearCart']);

// Ruta para fusionar el carrito de invitado al iniciar sesión
Route::middleware(['auth:api', 'role:Cliente'])->group(function () {
    Route::post('/carrito/fusionar', [carritoController::class, 'mergeGuestCart']);
});

Route::middleware(['auth:api', 'role:Admin'])->prefix('admin')->group(function () {
    // ... tus otras rutas de admin (ej. /pedidos, /profile) ...

    // Rutas para el Dashboard
    Route::get('/dashboard/total-ventas', [AdminDashboardController::class, 'getTotalVentas']);
    Route::get('/dashboard/total-pedidos', [AdminDashboardController::class, 'getTotalPedidos']);
    Route::get('/dashboard/total-clientes', [AdminDashboardController::class, 'getTotalClientes']);
    Route::get('/dashboard/productos-bajo-stock', [AdminDashboardController::class, 'getProductosBajoStock']);

    // Opcional: Si usas un solo endpoint para todas las estadísticas
    // Route::get('/dashboard/stats', [AdminDashboardController::class, 'getAllDashboardStats']);
});
// Factura
Route::get('/factura/pedido/{idPedido}', [facturaController::class, 'show']);


//Route::post('auth/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail'])->name('password.email');

// Ruta para restablecer la contraseña (para cuando el usuario haga clic en el enlace del email)
//Route::post('auth/reset-password', [ResetPasswordController::class, 'reset'])->name('password.update');