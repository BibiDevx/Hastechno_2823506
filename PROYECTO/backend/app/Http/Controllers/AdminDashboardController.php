<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\Cliente;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminDashboardController extends BaseController
{
    /**
     * @OA\Get(
     *     path="/api/admin/dashboard/total-ventas",
     *     summary="Obtener el total de ventas",
     *     description="Suma el valor total de todos los productos en pedidos.",
     *     tags={"Dashboard Admin"},
     *     @OA\Response(
     *         response=200,
     *         description="Total de ventas obtenido correctamente.",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="totalVentas", type="number", format="float", example=12458.50)
     *             ),
     *             @OA\Property(property="message", type="string", example="Total de ventas obtenido correctamente.")
     *         )
     *     ),
     *     @OA\Response(response=500, description="Error al obtener total de ventas")
     * )
     */
    public function getTotalVentas()
    {
        Log::info('AdminDashboardController@getTotalVentas - Solicitud de total de ventas.');
        try {
            $totalVentas = DB::table('pedidoproducto')->sum('valorTotal');
            $totalVentas = round($totalVentas, 2);
            return $this->sendResponse(['totalVentas' => $totalVentas], 'Total de ventas obtenido correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al obtener total de ventas:', ['error' => $e->getMessage()]);
            return $this->sendError('Error al obtener total de ventas.', [], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/admin/dashboard/total-pedidos",
     *     summary="Obtener el número total de pedidos",
     *     tags={"Dashboard Admin"},
     *     @OA\Response(
     *         response=200,
     *         description="Total de pedidos obtenido correctamente.",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="totalPedidos", type="integer", example=85)
     *             ),
     *             @OA\Property(property="message", type="string", example="Total de pedidos obtenido correctamente.")
     *         )
     *     ),
     *     @OA\Response(response=500, description="Error al obtener total de pedidos")
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
     *     path="/api/admin/dashboard/total-clientes",
     *     summary="Obtener el número total de clientes",
     *     tags={"Dashboard Admin"},
     *     @OA\Response(
     *         response=200,
     *         description="Total de clientes obtenido correctamente.",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="totalClientes", type="integer", example=150)
     *             ),
     *             @OA\Property(property="message", type="string", example="Total de clientes obtenido correctamente.")
     *         )
     *     ),
     *     @OA\Response(response=500, description="Error al obtener total de clientes")
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
     *     path="/api/admin/dashboard/productos-bajo-stock",
     *     summary="Obtener número de productos con stock bajo",
     *     description="Devuelve el número de productos cuyo stock es menor o igual a 10 unidades.",
     *     tags={"Dashboard Admin"},
     *     @OA\Response(
     *         response=200,
     *         description="Productos con stock bajo obtenidos correctamente.",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="productosBajoStock", type="integer", example=12)
     *             ),
     *             @OA\Property(property="message", type="string", example="Productos con stock bajo obtenidos correctamente.")
     *         )
     *     ),
     *     @OA\Response(response=500, description="Error al obtener productos con stock bajo")
     * )
     */
    public function getProductosBajoStock()
    {
        Log::info('AdminDashboardController@getProductosBajoStock - Solicitud de productos con stock bajo.');
        try {
            $umbralStockBajo = 10;
            $productosBajoStock = Producto::where('cantidadStock', '<=', $umbralStockBajo)->count();
            return $this->sendResponse(['productosBajoStock' => $productosBajoStock], 'Productos con stock bajo obtenidos correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al obtener productos con stock bajo:', ['error' => $e->getMessage()]);
            return $this->sendError('Error al obtener productos con stock bajo.', [], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/admin/dashboard/estadisticas",
     *     summary="Obtener todas las estadísticas del dashboard",
     *     tags={"Dashboard Admin"},
     *     @OA\Response(
     *         response=200,
     *         description="Estadísticas del dashboard obtenidas correctamente.",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="totalVentas", type="number", format="float", example=12458.50),
     *                 @OA\Property(property="totalPedidos", type="integer", example=85),
     *                 @OA\Property(property="totalClientes", type="integer", example=150),
     *                 @OA\Property(property="productosBajoStock", type="integer", example=12)
     *             ),
     *             @OA\Property(property="message", type="string", example="Estadísticas del dashboard obtenidas correctamente.")
     *         )
     *     ),
     *     @OA\Response(response=500, description="Error al obtener estadísticas del dashboard")
     * )
     */
    public function getAllDashboardStats()
    {
        Log::info('AdminDashboardController@getAllDashboardStats - Solicitud de estadísticas completas.');
        try {
            $totalVentas = DB::table('pedidoproducto')->sum('valorTotal');
            $totalPedidos = Pedido::count();
            $totalClientes = Cliente::count();
            $umbralStockBajo = 10;
            $productosBajoStock = Producto::where('cantidadStock', '<=', $umbralStockBajo)->count();

            $stats = [
                'totalVentas' => round($totalVentas, 2),
                'totalPedidos' => $totalPedidos,
                'totalClientes' => $totalClientes,
                'productosBajoStock' => $productosBajoStock,
            ];

            return $this->sendResponse($stats, 'Estadísticas del dashboard obtenidas correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al obtener todas las estadísticas del dashboard:', ['error' => $e->getMessage()]);
            return $this->sendError('Error al obtener estadísticas del dashboard.', [], 500);
        }
    }
}
