<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\Cliente;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminDashboardController extends BaseController // Extiende de tu BaseController
{
    /**
     * Obtiene el total de ventas.
     * Suma el valorTotal de todos los PedidoProducto.
     * GET /api/admin/dashboard/total-ventas
     *
     * @return \Illuminate\Http\JsonResponse
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
     * Obtiene el número total de pedidos.
     * GET /api/admin/dashboard/total-pedidos
     *
     * @return \Illuminate\Http\JsonResponse
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
     * Obtiene el número total de clientes.
     * GET /api/admin/dashboard/total-clientes
     *
     * @return \Illuminate\Http\JsonResponse
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
     * Obtiene el número de productos con stock bajo.
     * Define un umbral para "stock bajo" (ej. 10 unidades).
     * GET /api/admin/dashboard/productos-bajo-stock
     *
     * @return \Illuminate\Http\JsonResponse
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
