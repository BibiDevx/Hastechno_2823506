<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Crea la tabla 'carrito' con todas las columnas y claves foráneas,
     * asegurando la compatibilidad con el carrito de invitado.
     */
    public function up(): void
    {
        Schema::create('carrito', function (Blueprint $table) {
            // Clave primaria de la tabla 'carrito'
            // Mapea a INT UNSIGNED AUTO_INCREMENT en MySQL, compatible con int(11)
            $table->increments('idCarrito'); 

            // Clave foránea para el cliente
            // Debe ser NULLABLE para los usuarios invitados.
            // unsignedInteger mapea a INT UNSIGNED, que es compatible con int(11) UNSIGNED.
            // Asumo que idCliente en la tabla 'cliente' es INT(11) UNSIGNED.
            $table->unsignedInteger('idCliente')->nullable(); 

            // Columna para el ID de invitado (UUID)
            // Será NULL para usuarios logueados y un UUID para invitados.
            $table->uuid('guest_id')->nullable(); 
            $table->index('guest_id'); // Índice para búsquedas eficientes por guest_id

            // Clave foránea para el producto
            // Asumo que idProducto en la tabla 'producto' es INT(11) UNSIGNED.
            $table->unsignedInteger('idProducto'); 

            // Cantidad del producto en el carrito
            $table->integer('cantidad')->default(1); 

            // Timestamps para el registro de creación y actualización
            $table->timestamps();

            // Definición de las restricciones de clave foránea

            // Clave foránea a la tabla 'cliente'
            // onDelete('cascade'): Si un cliente es eliminado, sus ítems de carrito también se eliminan.
            // onUpdate('cascade'): Si el idCliente cambia (poco probable), se actualiza en el carrito.
            $table->foreign('idCliente')
                  ->references('idCliente') // Hace referencia a la columna idCliente en la tabla 'cliente'
                  ->on('cliente')         // En la tabla 'cliente'
                  ->onDelete('cascade')   
                  ->onUpdate('cascade');   

            // Clave foránea a la tabla 'producto'
            // onDelete('cascade'): Si un producto es eliminado, sus ítems de carrito también se eliminan.
            // onUpdate('cascade'): Si el idProducto cambia (poco probable), se actualiza en el carrito.
            $table->foreign('idProducto')
                  ->references('idProducto') // Hace referencia a la columna idProducto en la tabla 'producto'
                  ->on('producto')         // En la tabla 'producto'
                  ->onDelete('cascade')   
                  ->onUpdate('cascade');   
        });
    }

    /**
     * Reverse the migrations.
     * Elimina la tabla 'carrito' si la migración se revierte.
     */
    public function down(): void
    {
        Schema::dropIfExists('carrito');
    }
};
