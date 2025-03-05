import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../firestore.service';
import { AlertController, ToastController } from '@ionic/angular';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';
import { LoadingController } from '@ionic/angular';
import { snapshotEqual } from 'firebase/firestore';

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
  modoEdicion: boolean = true; // True por defecto (modo edición)
  imageSelec: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private firestoreService: FirestoreService,
    private router: Router,
    private loadingController: LoadingController,
    private toastContorller: ToastController,
    private imagePicker: ImagePicker,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id')!;

    if (this.id === "nuevo") {
      // Modo de creación
      this.clienteEditando = {
        nombre: '',
        apellidos: '',
        telefono: '',
        email: '',
        ciudad: '',
        saldo: 0 
      };
      this.modoEdicion = false; // Indica que estamos añadiendo un nuevo cliente
    } else {
      // Modo de edición
      this.modoEdicion = true;
      this.firestoreService.consultarClientePorId(this.id).then((cliente: any) => {
        if (cliente) {
          this.clienteEditando = cliente;
        }
      }).catch(error => {
        console.error("Error al consultar el cliente:", error);
      });
    }
  }

  // Validación de duplicados antes de guardar
  async validarClienteAntesDeGuardar() {
    const existe = await this.firestoreService.verificarExistencia(
      this.clienteEditando.email, 
      this.clienteEditando.telefono,
      this.id // Solo ignorar si es el mismo cliente
    );

    if (existe) {
      this.mostrarAlerta("Error", "El email o el teléfono ya están registrados.");
      return false;
    }

    return true;
  }

  // Función para guardar o editar los cambios del cliente
  async clickBotonModificar(cliente: any) {
    const esValido = await this.validarClienteAntesDeGuardar();
    if (!esValido) return;

    if (this.modoEdicion) {
      // Actualizar cliente
      this.firestoreService.actualizarCliente("clientes", this.id, cliente).then(() => {
        console.log("Cliente actualizado correctamente");
        this.router.navigate(['/home']);
      }).catch((error) => {
        console.error("Error al actualizar el cliente: ", error);
      });
    } else {
      // Añadir cliente
      this.firestoreService.agregarCliente("clientes", cliente).then(() => {
        console.log("Cliente añadido correctamente");
        this.router.navigate(['/home']);
      }).catch((error) => {
        console.error("Error al añadir el cliente: ", error);
      });
    }
  }

  // Función de confirmación para el borrado del cliente
  async confirmarBorrado(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar Borrado',
      message: '¿Estás seguro de que quieres eliminar este cliente?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Borrado cancelado');
          }
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.clickBotonBorrar(id);
          }
        }
      ]
    });

    await alert.present();
  }

  // Función para eliminar el cliente
  clickBotonBorrar(id: string) {
    this.firestoreService.borrarCliente("clientes", id).then(() => {
      console.log("Cliente eliminado correctamente");
      this.router.navigate(['/home']);
    }).catch((error) => {
      console.error("Error al eliminar el cliente: ", error);
    });
  }

  // Función para mostrar alertas de validación o errores
  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });

    await alert.present();
  }

  // Método para añadir un nuevo cliente
  async clickBotonAnadir(cliente: any) {
    const esValido = await this.validarClienteAntesDeGuardar();
    if (!esValido) return;

    this.firestoreService.agregarCliente("clientes", cliente).then(() => {
      console.log("Cliente añadido correctamente");
      this.router.navigate(['/home']);
    }).catch((error) => {
      console.error("Error al añadir el cliente: ", error);
    });
  }

  async seleccionarImagen() {
    this.imagePicker.hasReadPermission().then(
      (result) => {
      if (result == false) {
       this.imagePicker.requestReadPermission();
      }
      else{
        this.imagePicker.getPictures({
          maximumImagesCount: 1,
          outputType: 1
        }).then(
          (results) => {
          if(results.length > 0){
            this.imageSelec = 'data:image/jpeg;base64,' + results[0];
            console.log("Imagen seleccionada " + this.imageSelec);
          }
        }, 
        (err) => {
          console.log(err)
        }
        );
      }
    }, (err) => {
      console.log(err);
    });
}

async subirImagen(){
  const loading = await this.loadingController.create({
    message: 'Subiendo imagen...'
});

const toast = await this.toastContorller.create({
    message: 'Imagen subida correctamente',
    duration: 3000
});

let nombreCarpeta = "imagenes-DavidLopez";

loading.present();

let nombreImagen = `${new Date().getTime()}`;

this.firestoreService.subirImagenBase64(nombreCarpeta, nombreImagen, this.imageSelec)
.then(snapshot => {
    snapshot.ref.getDownloadURL().then(downloadURL => {
      console.log("URL de descarga: ", downloadURL);
      toast.present();
      loading.dismiss();
    })
  })
}

async eliminarArchivo(fileURL: string){
  const toast = await this.toastContorller.create({
    message: 'Imagen eliminada correctamente',
    duration: 3000
  });
  this.firestoreService.eliminarArchivoPorURL(fileURL)
  .then(() => {
    toast.present();
  }, (err) => {
    console.log(err);
  });
}

}
