/**
Estados posibles de un turno médico, se utilizan para controlar el flujo del turno desde su creación hasta su finalización.
 */
export enum AppointmentStatus {
  PENDING = 'PENDING',      
  CONFIRMED = 'CONFIRMED',  
  CANCELLED = 'CANCELLED',  
  COMPLETED = 'COMPLETED',
}
