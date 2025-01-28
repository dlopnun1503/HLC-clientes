import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private app = initializeApp(environment.firebaseConfig);
  private db = getFirestore(this.app);

  constructor(private firestore: AngularFirestore) {}

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
}
