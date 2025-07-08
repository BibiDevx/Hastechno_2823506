<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\Cliente;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * @OA\Tag(
 * name="Dashboard de Administración",
 * description="Endpoints para obtener estadísticas y métricas del dashboard de administración."
 * )
 */
class AdminDashboardController extends BaseController // Extiende de tu BaseController
{
    /**
     * @OA\Get(
     * path="/api/admin/dashboard/total-ventas",
     * summary="Obtiene el total de ventas del sistema.",
     * tags={"Dashboard de Administración"},
     * security={{"bearerAuth": {}}},
     * @OA\Response(
     * response=200,
     * description="Total de ventas obtenido correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Total de ventas obtenido correctamente."),
     * @OA\Property(
     * property="data",
     * type="object",
     * @OA\Property(property="totalVentas", type="number", format="float", example=12345.67, description="Suma total de todas las ventas.")
     * )
     * )
     * ),
     * @OA\Response(
     * response=500,
     * description="Error interno del servidor al obtener el total de ventas.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
     * )
     */
    public function getTotalVentas()
    {
        Log::info('AdminDashboardController@getTotalVentas - Solicitud de total de ventas.');
        try {
            // Suma el campo 'valorTotal' de la tabla 'pedidoproducto'
            $totalVentas = DB::table('pedidoproducto')->sum('valorTotal');
            $totalVentas = round($totalVentas, 2); // Redondear a 2 decimales

            return $this->sendResponse(['totalVentas' => $totalVentas], 'Total de ventas obtenido correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al obtener total de ventas:', ['error' => $e->getMessage()]);
            return $this->sendError('Error al obtener total de ventas.', [], 500);
        }
    }

    /**
     * @OA\Get(
     * path="/api/admin/dashboard/total-pedidos",
     * summary="Obtiene el número total de pedidos.",
     * tags={"Dashboard de Administración"},
     * security={{"bearerAuth": {}}},
     * @OA\Response(
     * response=200,
     * description="Total de pedidos obtenido correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Total de pedidos obtenido correctamente."),
     * @OA\Property(
     * property="data",
     * type="object",
     * @OA\Property(property="totalPedidos", type="integer", example=500, description="Número total de pedidos en el sistema.")
     * )
     * )
     * ),
     * @OA\Response(
     * response=500,
     * description="Error interno del servidor al obtener el total de pedidos.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
     * )
     */
    public function getTotalPedidos()
    {
        Log::info('AdminDashboardController@getTotalPedidos - Solicitud de total de pedidos.');
        try {
            $totalPedidos = Pedido::count();
            return $this->sendResponse(['totalPedidos' => $totalPedidos], 'Total de pedidos obtenido correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al obtener total de pedidos:', ['error' => $e->getMessage()]);
            return $this->sendError('Error al obtener total de pedidos.', [], 500);
        }
    }

    /**
     * @OA\Get(
     * path="/api/admin/dashboard/total-clientes",
     * summary="Obtiene el número total de clientes.",
     * tags={"Dashboard de Administración"},
     * security={{"bearerAuth": {}}},
     * @OA\Response(
     * response=200,
     * description="Total de clientes obtenido correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Total de clientes obtenido correctamente."),
     * @OA\Property(
     * property="data",
     * type="object",
     * @OA\Property(property="totalClientes", type="integer", example=150, description="Número total de clientes registrados.")
     * )
     * )
     * ),
     * @OA\Response(
     * response=500,
     * description="Error interno del servidor al obtener el total de clientes.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
     * )
     */
    public function getTotalClientes()
    {
        Log::info('AdminDashboardController@getTotalClientes - Solicitud de total de clientes.');
        try {
            $totalClientes = Cliente::count();
            return $this->sendResponse(['totalClientes' => $totalClientes], 'Total de clientes obtenido correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al obtener total de clientes:', ['error' => $e->getMessage()]);
            return $this->sendError('Error al obtener total de clientes.', [], 500);
        }
    }

    /**
     * @OA\Get(
     * path="/api/admin/dashboard/productos-bajo-stock",
     * summary="Obtiene el número de productos con stock bajo.",
     * tags={"Dashboard de Administración"},
     * security={{"bearerAuth": {}}},
     * @OA\Response(
     * response=200,
     * description="Productos con stock bajo obtenidos correctamente.",
     * @OA\JsonContent(
     * type="object",
     * @OA\Property(property="success", type="boolean", example=true),
     * @OA\Property(property="message", type="string", example="Productos con stock bajo obtenidos correctamente."),
     * @OA\Property(
     * property="data",
     * type="object",
     * @OA\Property(property="productosBajoStock", type="integer", example=5, description="Número de productos cuyo stock está por debajo o igual al umbral definido.")
     * )
     * )
     * ),
     * @OA\Response(
     * response=500,
     * description="Error interno del servidor al obtener productos con stock bajo.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * ),
     * @OA\Response(
     * response=401,
     * description="No autenticado.",
     * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     * )
     * )
     */
    public function getProductosBajoStock()
    {
        Log::info('AdminDashboardController@getProductosBajoStock - Solicitud de productos con stock bajo.');
        try {
            $umbralStockBajo = 10; // Puedes ajustar este valor
            $productosBajoStock = Producto::where('cantidadStock', '<=', $umbralStockBajo)->count();
            return $this->sendResponse(['productosBajoStock' => $productosBajoStock], 'Productos con stock bajo obtenidos correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al obtener productos con stock bajo:', ['error' => $e->getMessage()]);
            return $this->sendError('Error al obtener productos con stock bajo.', [], 500);
        }
    }

    // Opcional: Un solo endpoint para obtener todas las estadísticas a la vez (más eficiente)
    // /**
    //  * @OA\Get(
    //  * path="/api/admin/dashboard/stats",
    //  * summary="Obtiene todas las estadísticas del dashboard de administración en una sola solicitud.",
    //  * tags={"Dashboard de Administración"},
    //  * security={{"bearerAuth": {}}},
    //  * @OA\Response(
    //  * response=200,
    //  * description="Estadísticas del dashboard obtenidas correctamente.",
    //  * @OA\JsonContent(
    //  * type="object",
    //  * @OA\Property(property="success", type="boolean", example=true),
    //  * @OA\Property(property="message", type="string", example="Estadísticas del dashboard obtenidas correctamente."),
    //  * @OA\Property(
    //  * property="data",
    //  * type="object",
    //  * @OA\Property(property="totalVentas", type="number", format="float", example=12345.67, description="Suma total de todas las ventas."),
    //  * @OA\Property(property="totalPedidos", type="integer", example=500, description="Número total de pedidos en el sistema."),
    //  * @OA\Property(property="totalClientes", type="integer", example=150, description="Número total de clientes registrados."),
    //  * @OA\Property(property="productosBajoStock", type="integer", example=5, description="Número de productos cuyo stock está por debajo o igual al umbral definido.")
    //  * )
    //  * )
    //  * ),
    //  * @OA\Response(
    //  * response=500,
    //  * description="Error interno del servidor al obtener estadísticas del dashboard.",
    //  * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
    //  * ),
    //  * @OA\Response(
    //  * response=401,
    //  * description="No autenticado.",
    //  * @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
    //  * )
    //  * )
    //  */
    // public function getAllDashboardStats()
    // {
    //     try {
    //         $totalVentas = DB::table('pedidoproducto')->sum('valorTotal');
    //         $totalPedidos = Pedido::count();
    //         $totalClientes = Cliente::count();
    //         $umbralStockBajo = 10;
    //         $productosBajoStock = Producto::where('cantidadStock', '<=', $umbralStockBajo)->count();

    //         $stats = [
    //             'totalVentas' => round($totalVentas, 2),
    //             'totalPedidos' => $totalPedidos,
    //             'totalClientes' => $totalClientes,
    //             'productosBajoStock' => $productosBajoStock,
    //         ];
    //         return $this->sendResponse($stats, 'Estadísticas del dashboard obtenidas correctamente.');
    //     } catch (\Exception $e) {
    //         Log::error('Error al obtener todas las estadísticas del dashboard:', ['error' => $e->getMessage()]);
    //         return $this->sendError('Error al obtener estadísticas del dashboard.', [], 500);
    //     }
    // }
}
