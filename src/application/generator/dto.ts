/** Serializable shapes that cross the server/client boundary. No domain objects leak out. */

export interface DrawDto {
  numbers: number[];
  issuedAt: string;
  /** The draw as a one-time sign-in code ("380591"); null if the scope can't be written as one. */
  code: string | null;
  /** Draws still available after this one; 0 means the next request will be refused. */
  remaining: number;
}

export interface GeneratorStatusDto {
  count: number;
  min: number;
  max: number;
  combinations: number;
  remaining: number;
}
