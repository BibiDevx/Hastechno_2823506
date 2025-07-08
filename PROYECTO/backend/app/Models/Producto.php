<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @OA\Schema(
 * schema="Producto",
 * title="Producto",
 * description="Representa un producto disponible en el inventario de la tienda.",
 * @OA\Property(
 * property="idProducto",
 * type="integer",
 * format="int64",
 * description="ID único del producto.",
 * readOnly=true,
 * example=1
 * ),
 * @OA\Property(
 * property="nombreProducto",
 * type="string",
 * description="Nombre del producto.",
 * example="Laptop Ultrabook X1"
 * ),
 * @OA\Property(
 * property="definicion",
 * type="string",
 * description="Descripción detallada del producto.",
 * example="Laptop de alto rendimiento con procesador i7, 16GB RAM y 512GB SSD."
 * ),
 * @OA\Property(
 * property="valorProducto",
 * type="number",
 * format="float",
 * description="Precio del producto.",
 * example=1200.50
 * ),
 * @OA\Property(
 * property="idProveedor",
 * type="integer",
 * format="int64",
 * description="ID del proveedor del producto.",
 * example=1
 * ),
 * @OA\Property(
 * property="disponibilidad",
 * type="boolean",
 * description="Indica si el producto está disponible para la venta.",
 * example=true
 * ),
 * @OA\Property(
 * property="cantidadStock",
 * type="integer",
 * description="Cantidad de unidades del producto en stock.",
 * example=50
 * ),
 * @OA\Property(
 * property="idMarca",
 * type="integer",
 * format="int64",
 * description="ID de la marca del producto.",
 * example=1
 * ),
 * @OA\Property(
 * property="created_at",
 * type="string",
 * format="date-time",
 * description="Fecha y hora de creación del producto.",
 * readOnly=true
 * ),
 * @OA\Property(
 * property="updated_at",
 * type="string",
 * format="date-time",
 * description="Fecha y hora de la última actualización del producto.",
 * readOnly=true
 * ),
 * @OA\Property(
 * property="marca",
 * ref="#/components/schemas/Marca",
 * description="Objeto de la marca asociada al producto (cargado con eager loading)."
 * ),
 * @OA\Property(
 * property="proveedor",
 * ref="#/components/schemas/ProveedorBasic",
 * description="Información básica del proveedor asociado al producto (cargado con eager loading)."
 * )
 * )
 *
 * @OA\Schema(
 * schema="ProveedorBasic",
 * title="Proveedor Básico",
 * description="Información básica de un proveedor, usada en el contexto de un producto.",
 * @OA\Property(
 * property="idProveedor",
 * type="integer",
 * format="int64",
 * description="ID único del proveedor.",
 * example=1
 * ),
 * @OA\Property(
 * property="nombreProveedor",
 * type="string",
 * description="Nombre del proveedor.",
 * example="Tech Supplies Inc."
 * )
 * )
 */
class Producto extends Model
{
    use HasFactory;

    protected $table = 'producto';
    protected $primaryKey = 'idProducto';
    protected $fillable = [
        'nombreProducto',
        'definicion',
        'valorProducto',
        'idProveedor',
        'disponibilidad',
        'cantidadStock',
        'idMarca'
    ];

    public function marca()
    {
        return $this->belongsTo(Marca::class, 'idMarca');
    }

    public function categorias()
    {
        return $this->belongsToMany(Categoria::class, 'categoriaproducto', 'idProducto', 'idCategoria');
    }

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    public function proveedor()
    {
        // Nota: La carga ansiosa con select(['idProveedor', 'nombreProveedor'])
        // se refleja en el esquema ProveedorBasic.
        return $this->belongsTo(Proveedor::class, 'idProveedor')->select(['idProveedor', 'nombreProveedor']);
    }
    public function pedidos()
    {
        return $this->hasMany(PedidoProducto::class, 'idProducto');
    }
    protected $casts = [
        'disponibilidad' => 'boolean', // <--- ¡AÑADE ESTA LÍNEA!
    ];
}
