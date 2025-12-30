
export enum PaymentStatus {
  /**El pago fue creado pero aún no confirmado*/
  PENDING = 'PENDING',

  /**El pago fue aprobado correctamente*/
  APPROVED = 'APPROVED',

  /**El pago fue rechazado por el proveedor*/
  REJECTED = 'REJECTED',

  /**El pago llegó cuando el turno ya no era válido*/
  IGNORED = 'IGNORED',

  /**El pago fue devuelto al usuario*/
  REFUNDED = 'REFUNDED',
}
