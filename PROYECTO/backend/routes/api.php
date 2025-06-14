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
use App\Http\Controllers\pedidoProductoController;
use App\Http\Controllers\carritoController;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Route;

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
    Route::delete('/roles/eliminar/{id}', [rolController::class, 'destroy'])->where('id', '[0-9]+');
});
///////////////////////////////////////////////////////////////////////
//PRODUCTOS
Route::middleware(['auth:api', 'role:Admin'])->prefix('productos')->group(function () {
    Route::get('/detalles', [productoController::class, 'detalles']);
    Route::post('/registrar', [productoController::class, 'store']);
    Route::patch('/actualizar/{id}', [productoController::class, 'updatePartial'])->where('id', '[0-9]+');
    Route::delete('/eliminar/{id}', [productoController::class, 'destroy'])->where('id', '[0-9]+');
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
/////////Faltantes por probar y asignar
// Productos por pedido
Route::get('/pedido/{idPedido}/productos', [PedidoProductoController::class, 'index']);
Route::post('/pedido-producto', [PedidoProductoController::class, 'store']);
// Carrito
Route::get('/carrito', [CarritoController::class, 'index']);
Route::post('/carrito', [CarritoController::class, 'store']);
Route::patch('/carrito/{idCarrito}', [CarritoController::class, 'update']);
Route::delete('/carrito/{idCarrito}', [CarritoController::class, 'destroy']);
Route::post('/carrito/vaciar', [CarritoController::class, 'clearCart']);

// Ruta para fusionar el carrito de invitado al iniciar sesión
// ESTA RUTA SÍ DEBE ESTAR PROTEGIDA y solo es para usuarios autenticados
Route::middleware(['auth:api','role:Cliente'])->group(function () {
    Route::post('/carrito/fusionar', [CarritoController::class, 'mergeGuestCart']);
    // Opcional: Si quieres que las operaciones de carrito de USUARIOS logueados *solo* se hagan
    // a través de rutas con autenticación obligatoria, podrías duplicar las de arriba
    // y ponerlas aquí con auth:api y eliminar el chequeo de guestId en los métodos del controlador.
    // Pero la implementación actual del controlador es más flexible.
});

// Pedidos
Route::get('/pedidos/{idCliente}', [PedidoController::class, 'index']);
Route::post('/pedidos', [PedidoController::class, 'store']);
Route::get('/pedido/{id}', [PedidoController::class, 'show']);

// Factura
Route::get('/factura/pedido/{idPedido}', [FacturaController::class, 'show']);
Route::post('/factura', [FacturaController::class, 'store']);

Route::middleware(['auth:api', 'role:SuperAdmin'])->group(function () {

    // Rutas para la gestión de USUARIOS y sus ROLES (operaciones sobre la tabla 'usuario')

    // Obtener la lista completa de usuarios con sus roles asociados
    // Esta ruta es la que usará `userService.getAllUsersWithRoles`
    Route::get('/usuarios-con-roles', [UsuarioController::class, 'indexUsersWithRoles']);

    // Actualizar el rol de un usuario específico
    // Esta ruta es la que usará `userService.updateUserRole`
    Route::patch('/usuarios/{idUsuario}/actualizar-rol', [UsuarioController::class, 'updateRol'])
        ->where('idUsuario', '[0-9]+');

    // Obtener los detalles de un usuario específico por ID
    // Esta ruta es la que usará `userService.getUserById` (si lo implementas en el frontend)
    Route::get('/usuarios/{idUsuario}', [UsuarioController::class, 'show'])
        ->where('idUsuario', '[0-9]+');

    // Eliminar un usuario específico por ID
    // Esta ruta es la que usará `userService.deleteUser`
    Route::delete('/usuarios/{idUsuario}', [UsuarioController::class, 'destroy'])
        ->where('idUsuario', '[0-9]+');

    // ... aquí irían también tus otras rutas protegidas por SuperAdmin
    // como las de roles (control/roles/...) y las de admin (users/...)
});