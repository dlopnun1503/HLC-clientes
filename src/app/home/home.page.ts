import { Component } from '@angular/core';
import { Cliente } from '../cliente';
import { FirestoreService } from '../firestore.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  arrayColeccionClientes: any[] = [];
  clienteEditando: any = {};
  estaEditando: boolean = false;

  constructor(private firestoreService: FirestoreService, private router: Router) {}

  obtenerListaClientes() {
    this.firestoreService.obtenerTodos('clientes').subscribe((res: any[]) => {
      this.arrayColeccionClientes = res.map((doc) => ({
        id: doc.payload.doc.id, // ID del documento
        data: doc.payload.doc.data(), // Datos del documento
      }));
    });
  }
  

  guardarCliente() {
    if (this.estaEditando) {
      this.firestoreService
        .actualizar('clientes', this.clienteEditando.id, {
          ...this.clienteEditando,
          saldo: parseFloat(this.clienteEditando.saldo), // Garantiza un valor decimal
        })
        .then(() => {
          console.log('Cliente actualizado correctamente');
          this.estaEditando = false;
          this.clienteEditando = {};
          this.obtenerListaClientes();
        })
        .catch((error) => console.error('Error al actualizar cliente:', error));
    } else {
      this.firestoreService
        .insertar('clientes', {
          ...this.clienteEditando,
          saldo: parseFloat(this.clienteEditando.saldo), // Garantiza un valor decimal
        })
        .then(() => {
          console.log('Cliente añadido correctamente');
          this.clienteEditando = {};
          this.obtenerListaClientes();
        })
        .catch((error) => console.error('Error al añadir cliente:', error));
    }
  }
  

  clickBotonEditar(cliente: any) {
    console.log('Editando cliente:', cliente);
    this.clienteEditando = {
      ...cliente.data, // Copia todos los datos del cliente
      saldo: cliente.data.saldo || 0, // Garantiza que saldo sea un número, incluso si está indefinido
      id: cliente.id, // Incluye el ID para poder actualizar
    };
    this.estaEditando = true; // Cambia al modo edición
    this.router.navigate(['/detalle', this.clienteEditando.id]);
  }
  

  clickBotonBorrar(id: string) {
    this.firestoreService
      .borrar('clientes', id)
      .then(() => {
        console.log('Cliente borrado correctamente');
        this.obtenerListaClientes(); // Recarga la lista
      })
      .catch((error) => {
        console.error('Error al borrar el cliente:', error);
      });
  }

  ngOnInit() {
    this.obtenerListaClientes();
  }
}
