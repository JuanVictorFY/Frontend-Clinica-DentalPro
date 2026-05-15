import { EstadoCitaPipe, EstadoCitaDisplay } from './estado-cita.pipe';

describe('EstadoCitaPipe', () => {
  let pipe: EstadoCitaPipe;

  beforeEach(() => {
    pipe = new EstadoCitaPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform without field parameter', () => {
    it('should return display object for PENDIENTE', () => {
      const result = pipe.transform('PENDIENTE') as EstadoCitaDisplay;
      expect(result.label).toBe('Pendiente');
      expect(result.cssClass).toBe('estado-pendiente');
    });

    it('should return display object for ATENDIDO', () => {
      const result = pipe.transform('ATENDIDO') as EstadoCitaDisplay;
      expect(result.label).toBe('Atendido');
      expect(result.cssClass).toBe('estado-atendido');
    });

    it('should return display object for CANCELADO', () => {
      const result = pipe.transform('CANCELADO') as EstadoCitaDisplay;
      expect(result.label).toBe('Cancelado');
      expect(result.cssClass).toBe('estado-cancelado');
    });

    it('should return display object for REAGENDADO', () => {
      const result = pipe.transform('REAGENDADO') as EstadoCitaDisplay;
      expect(result.label).toBe('Reagendado');
      expect(result.cssClass).toBe('estado-reagendado');
    });
  });

  describe('transform with label field', () => {
    it('should return label string for PENDIENTE', () => {
      expect(pipe.transform('PENDIENTE', 'label')).toBe('Pendiente');
    });

    it('should return label string for ATENDIDO', () => {
      expect(pipe.transform('ATENDIDO', 'label')).toBe('Atendido');
    });

    it('should return label string for CANCELADO', () => {
      expect(pipe.transform('CANCELADO', 'label')).toBe('Cancelado');
    });

    it('should return label string for REAGENDADO', () => {
      expect(pipe.transform('REAGENDADO', 'label')).toBe('Reagendado');
    });
  });

  describe('transform with class field', () => {
    it('should return CSS class for PENDIENTE', () => {
      expect(pipe.transform('PENDIENTE', 'class')).toBe('estado-pendiente');
    });

    it('should return CSS class for ATENDIDO', () => {
      expect(pipe.transform('ATENDIDO', 'class')).toBe('estado-atendido');
    });

    it('should return CSS class for CANCELADO', () => {
      expect(pipe.transform('CANCELADO', 'class')).toBe('estado-cancelado');
    });

    it('should return CSS class for REAGENDADO', () => {
      expect(pipe.transform('REAGENDADO', 'class')).toBe('estado-reagendado');
    });
  });

  describe('case insensitivity', () => {
    it('should handle lowercase input', () => {
      const result = pipe.transform('pendiente') as EstadoCitaDisplay;
      expect(result.label).toBe('Pendiente');
      expect(result.cssClass).toBe('estado-pendiente');
    });

    it('should handle mixed case input', () => {
      const result = pipe.transform('Atendido') as EstadoCitaDisplay;
      expect(result.label).toBe('Atendido');
      expect(result.cssClass).toBe('estado-atendido');
    });
  });

  describe('edge cases', () => {
    it('should return default display for null value', () => {
      const result = pipe.transform(null) as EstadoCitaDisplay;
      expect(result.label).toBe('Desconocido');
      expect(result.cssClass).toBe('');
    });

    it('should return default display for undefined value', () => {
      const result = pipe.transform(undefined) as EstadoCitaDisplay;
      expect(result.label).toBe('Desconocido');
      expect(result.cssClass).toBe('');
    });

    it('should return default label for null with label field', () => {
      expect(pipe.transform(null, 'label')).toBe('Desconocido');
    });

    it('should return empty class for null with class field', () => {
      expect(pipe.transform(null, 'class')).toBe('');
    });

    it('should return original value as label for unknown status', () => {
      const result = pipe.transform('DESCONOCIDO') as EstadoCitaDisplay;
      expect(result.label).toBe('DESCONOCIDO');
      expect(result.cssClass).toBe('');
    });
  });
});
