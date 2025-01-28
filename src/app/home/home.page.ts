import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreService } from '../firestore.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  arrayColeccionClientes: any[] = [];

  constructor(
    private firestoreService: FirestoreService,
    private router: Router
  ) {}

  ngOnInit() {
    // Consultar los clientes y sus datos
    this.firestoreService.consultarClientes().subscribe((snapshot: any) => {
      snapshot.forEach((doc: any) => {
        this.arrayColeccionClientes.push({
          id: doc.payload.doc.id,
          data: doc.payload.doc.data()
        });
      });
    });
  }

  verDetalleCliente(id: string) {
    this.router.navigate(['/detalle', id]);
  }
}
