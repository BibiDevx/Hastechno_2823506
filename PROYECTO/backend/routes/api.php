<?php
use App\Http\Controllers\adminController;
use App\Http\Controllers\categoriaController;
use App\Http\Controllers\clienteController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\marcaController;
use App\Http\Controllers\productoController;
use App\Http\Controllers\rolController;
use App\Http\Controllers\proveedorController;
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
    Route::get('/', [adminController::class, 'index']);
    Route::get('/{id}', [adminController::class, 'show'])->where('id', '[0-9]+');
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
    Route::patch('/admin/{id}', [adminController::class, 'actualizarAdmins'])->where('id', '[0-9]+'); // Actualización parcial puede cambiar rol
    Route::delete('/admin/{id}', [adminController::class, 'destroy'])->where('id', '[0-9]+');
}); 
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
Route::prefix('verProveedores')->group(function () {
    Route::get('/', [proveedorController::class, 'index']);
    Route::get('/{id}', [proveedorController::class, 'show'])->where('id', '[0-9]+');
});

Route::middleware(['auth:api', 'role:Admin'])->prefix('proveedores')->group(function () {
    Route::post('/registrar', [proveedorController::class, 'store']);
    Route::patch('/actualizar/{id}', [proveedorController::class, 'updatePartial'])->where('id', '[0-9]+');
    Route::delete('/eliminar/{id}', [proveedorController::class, 'destroy'])->where('id', '[0-9]+');
});