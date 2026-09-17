/** A single source photo the user captured or picked from the gallery. */
export interface SourcePhoto {
  id: string;
  uri: string;
  width: number;
  height: number;
  capturedAt: string;
  source: 'camera' | 'gallery';
}

/** Editable correction applied by the user on top of an automatic mask. */
export type MaskEditOp =
  | { type: 'add'; pathId: string }
  | { type: 'remove'; pathId: string }
  | { type: 'restore'; pathId: string }
  | { type: 'undo' };

/** Result of isolating the vehicle from its background. */
export interface VehicleMask {
  id: string;
  sourcePhotoId: string;
  /** URI of the alpha mask image (vehicle = opaque, background = transparent). */
  maskUri: string;
  /** URI of a preview with the vehicle cut out over a neutral backdrop. */
  previewUri: string;
  confidence: number;
  edits: MaskEditOp[];
  status: 'pending' | 'detected' | 'reviewed';
}

/** The protected subject of every composition — never redesigned by the AI. */
export interface Vehicle {
  id: string;
  sourcePhoto: SourcePhoto;
  mask: VehicleMask;
  label?: string;
  createdAt: string;
  /** Vehicle Lock is on by default: identity-preserving generation only. */
  vehicleLockEnabled: boolean;
}
