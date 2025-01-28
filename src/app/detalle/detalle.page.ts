import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../firestore.service'; // Asegúrate de importar el servicio de Firestore

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {
  
  clienteEditando: any = {
    nombre: '',
    apellidos: '',
    telefono: '',
    email: '',
    ciudad: '',
    saldo: 0
  };

  id: string = '';  // Para guardar el id del cliente recibido

  constructor(
    private activatedRoute: ActivatedRoute,
    private firestoreService: FirestoreService,
    private router: Router
  ) {}

  ngOnInit() {
    // Obtener el 'id' del cliente desde la URL usando ActivatedRoute
    this.id = this.activatedRoute.snapshot.paramMap.get('id')!;
    
    // Luego hacer la consulta al servicio de Firestore
    if (this.id) {
      this.firestoreService.consultarClientePorId(this.id).then((cliente: any) => {
        if (cliente) {
          this.clienteEditando = cliente; // Asignamos los datos recibidos al formulario
        }
      }).catch(error => {
        console.error("Error al consultar el cliente:", error);
      });
    }
  }

  // Función para guardar los cambios del cliente
  clickBotonEditar(cliente: any) {
    console.log("Editar cliente", cliente);
    // Verifica si el cliente tiene un ID válido
  if (cliente.id) {
    // Llamar a la función de Firestore para actualizar el cliente
    this.firestoreService.actualizarCliente("clientes", cliente.id, cliente).then(() => {
      console.log("Cliente actualizado correctamente");
      // Redirigir a la página de inicio
      this.router.navigate(['/home']);
    }).catch((error) => {
      console.error("Error al actualizar el cliente: ", error);
    });
  } else {
    console.error("ID del cliente no válido");
  }
}

  // Función para borrar el cliente
  clickBotonBorrar(id: string) {
    console.log("Borrar cliente", id);
    // Llamar a la función de Firestore para eliminar el cliente
  this.firestoreService.borrarCliente("clientes", id).then(() => {
    console.log("Cliente eliminado correctamente");
    // Redirigir a la página de inicio
    this.router.navigate(['/home']);
  }).catch((error) => {
    console.error("Error al eliminar el cliente: ", error);
  });
}
}
