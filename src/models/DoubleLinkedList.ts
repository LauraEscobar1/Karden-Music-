/**
 * Nodo para lista doblemente enlazada
 */
export class Node<T> {
  data: T;
  next: Node<T> | null = null;
  previous: Node<T> | null = null;

  constructor(data: T) {
    this.data = data;
  }
}

/**
 * Lista doblemente enlazada genérica
 */
export class DoubleLinkedList<T> {
  private head: Node<T> | null = null;
  private tail: Node<T> | null = null;
  private size: number = 0;

  /**
   * Agrega un elemento al final de la lista
   */
  append(data: T): void {
    const newNode = new Node(data);

    if (this.head === null) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      if (this.tail) {
        this.tail.next = newNode;
        newNode.previous = this.tail;
      }
      this.tail = newNode;
    }
    this.size++;
  }

  /**
   * Agrega un elemento al inicio de la lista
   */
  prepend(data: T): void {
    const newNode = new Node(data);

    if (this.head === null) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.previous = newNode;
      this.head = newNode;
    }
    this.size++;
  }

  /**
   * Inserta un elemento en una posición específica
   */
  insertAt(data: T, index: number): boolean {
    if (index < 0 || index > this.size) {
      return false;
    }

    if (index === 0) {
      this.prepend(data);
      return true;
    }

    if (index === this.size) {
      this.append(data);
      return true;
    }

    const newNode = new Node(data);
    let current = this.head;
    let previous: Node<T> | null = null;
    let count = 0;

    while (count < index) {
      previous = current;
      current = current!.next;
      count++;
    }

    newNode.next = current;
    newNode.previous = previous;

    if (previous) {
      previous.next = newNode;
    }
    if (current) {
      current.previous = newNode;
    }

    this.size++;
    return true;
  }

  /**
   * Elimina un elemento en una posición específica
   */
  removeAt(index: number): T | null {
    if (index < 0 || index >= this.size) {
      return null;
    }

    let current = this.head;
    let previous: Node<T> | null = null;
    let count = 0;

    while (count < index) {
      previous = current;
      current = current!.next;
      count++;
    }

    if (current) {
      if (index === 0) {
        this.head = current.next;
        if (this.head) {
          this.head.previous = null;
        }
      } else if (index === this.size - 1) {
        this.tail = previous;
        if (this.tail) {
          this.tail.next = null;
        }
      } else {
        if (previous) {
          previous.next = current.next;
        }
        if (current.next) {
          current.next.previous = previous;
        }
      }

      this.size--;
      return current.data;
    }

    return null;
  }

  /**
   * Obtiene un elemento en una posición específica
   */
  getAt(index: number): T | null {
    if (index < 0 || index >= this.size) {
      return null;
    }

    let current = this.head;
    let count = 0;

    while (count < index) {
      current = current!.next;
      count++;
    }

    return current ? current.data : null;
  }

  /**
   * Encuentra el índice de un elemento
   */
  indexOf(data: T): number {
    let current = this.head;
    let count = 0;

    while (current) {
      if (current.data === data) {
        return count;
      }
      current = current.next;
      count++;
    }

    return -1;
  }

  /**
   * Elimina un elemento específico
   */
  remove(data: T): boolean {
    const index = this.indexOf(data);
    if (index !== -1) {
      this.removeAt(index);
      return true;
    }
    return false;
  }

  /**
   * Obtiene el tamaño de la lista
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Verifica si la lista está vacía
   */
  isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Limpia la lista
   */
  clear(): void {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  /**
   * Convierte la lista a un array
   */
  toArray(): T[] {
    const array: T[] = [];
    let current = this.head;

    while (current) {
      array.push(current.data);
      current = current.next;
    }

    return array;
  }

  /**
   * Itera sobre los elementos de la lista
   */
  forEach(callback: (data: T, index: number) => void): void {
    let current = this.head;
    let index = 0;

    while (current) {
      callback(current.data, index);
      current = current.next;
      index++;
    }
  }

  /**
   * Filtra elementos de la lista
   */
  filter(predicate: (data: T) => boolean): T[] {
    const result: T[] = [];
    this.forEach((data) => {
      if (predicate(data)) {
        result.push(data);
      }
    });
    return result;
  }

  /**
   * Mapea elementos de la lista
   */
  map<U>(callback: (data: T) => U): U[] {
    const result: U[] = [];
    this.forEach((data) => {
      result.push(callback(data));
    });
    return result;
  }
}
