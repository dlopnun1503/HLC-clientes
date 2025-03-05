import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { environment } from '../environments/environment';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private app = initializeApp(environment.firebaseConfig);
  private db = getFirestore(this.app);

  constructor(private firestore: AngularFirestore, private angularFireStorage: AngularFireStorage) {}

  async verificarExistencia(email: string, telefono: string, id: string = ''): Promise<boolean> {
    const snapshot = await this.firestore.collection('clientes', ref => 
      ref.where('email', '==', email).where('telefono', '==', telefono))
      .get().toPromise();
    
    // Asegurarse de que snapshot exista antes de acceder a sus propiedades
    if (!snapshot || snapshot.empty) {
      return false; // Si no hay resultado, consideramos que no existe el duplicado
    }

    const clienteExistente = snapshot.docs.find(doc => doc.id !== id); // Excluir el cliente actual al editar
    return clienteExistente != null;
  }
  


  // Función para obtener todos los clientes (para la validación)
  obtenerClientes() {
    return this.firestore.collection("clientes").get().toPromise();
  }

  consultarClientes(): Observable<any> {
    return this.firestore.collection('clientes').snapshotChanges();
  }

  consultarPorId(collection: string, id: string): Observable<any> {
    return this.firestore.collection(collection).doc(id).snapshotChanges();
  }

  agregarCliente(collection: string, cliente: any) {
    return this.firestore.collection(collection).add(cliente);
  }

  actualizarCliente(collection: string, id: string, cliente: any) {
    return this.firestore.collection(collection).doc(id).update(cliente);
  }

  borrarCliente(collection: string, id: string) {
    return this.firestore.collection(collection).doc(id).delete();
  }

  async consultarClientePorId(id: string) {
    const clienteRef = doc(this.db, 'clientes', id);  // 'clientes' es el nombre de la colección
    const docSnap = await getDoc(clienteRef);
    if (docSnap.exists()) {
      return docSnap.data();  // Devuelve los datos del cliente
    } else {
      console.log("No hay documento con ese ID!");
      return null;
    }
  }

  public subirImagenBase64(nombreCarpeta: string, nombreArchivo: string, imagenBase64: string){
    let storageRef = this.angularFireStorage.ref(nombreCarpeta).child(nombreArchivo);
    return storageRef.putString(imagenBase64, 'data_url');
  }

  public eliminarArchivoPorURL(url: string){
    return this.angularFireStorage.storage.refFromURL(url).delete();
  }
}
